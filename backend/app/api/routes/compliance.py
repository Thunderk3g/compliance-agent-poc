from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
import uuid
import logging
import json
import asyncio
from ...database import get_db
from ...models.compliance_check import ComplianceCheck
from ...models.violation import Violation
from ...models.submission import Submission
from ...models.rule import Rule
from ...schemas.compliance import ComplianceCheckResponse, ViolationResponse
from ...schemas.deep_analysis import (
    DeepAnalysisRequest,
    DeepAnalysisResponse,
    SeverityWeights
)
from ...services.deep_analysis_service import deep_analysis_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/compliance", tags=["compliance"])


@router.get("/{submission_id}", response_model=ComplianceCheckResponse)
def get_compliance_results(
    submission_id: uuid.UUID,
    db: Session = Depends(get_db)
):
    """Get compliance check results for a submission."""
    check = db.query(ComplianceCheck).filter(
        ComplianceCheck.submission_id == submission_id
    ).first()

    if not check:
        raise HTTPException(404, "No compliance check found for this submission")

    # Load violations
    violations = db.query(Violation).filter(Violation.check_id == check.id).all()

    response = ComplianceCheckResponse(
        id=check.id,
        submission_id=check.submission_id,
        overall_score=float(check.overall_score),
        irdai_score=float(check.irdai_score),
        brand_score=float(check.brand_score),
        seo_score=float(check.seo_score),
        status=check.status,
        grade=check.grade,
        ai_summary=check.ai_summary,
        check_date=check.check_date,
        violations=[ViolationResponse.from_orm(v) for v in violations]
    )

    return response


@router.get("/{submission_id}/violations", response_model=List[ViolationResponse])
def get_violations(
    submission_id: uuid.UUID,
    db: Session = Depends(get_db)
):
    """Get violations for a submission."""
    check = db.query(ComplianceCheck).filter(
        ComplianceCheck.submission_id == submission_id
    ).first()

    if not check:
        raise HTTPException(404, "No compliance check found")

    violations = db.query(Violation).filter(Violation.check_id == check.id).all()

    return violations


# =============================================================================
# DEEP COMPLIANCE RESEARCH MODE ENDPOINTS
# =============================================================================

@router.post(
    "/{submission_id}/deep-analyze",
    response_model=DeepAnalysisResponse,
    summary="Run deep line-by-line compliance analysis"
)
async def run_deep_analysis(
    submission_id: uuid.UUID,
    request: DeepAnalysisRequest,
    db: Session = Depends(get_db)
):
    """
    Execute granular line-by-line compliance analysis with custom severity weights.
    
    **Deep Compliance Research Mode**
    
    This endpoint triggers a detailed analysis where:
    1. Document is segmented into individual lines
    2. Each line is analyzed for rule violations
    3. Scores are calculated using user-defined severity multipliers
    4. All results are persisted for audit trail
    
    **Governance Features:**
    - `severity_config_snapshot`: Exact weights used are stored
    - `rule_impact_breakdown`: Detailed ledger of all deductions
    
    **Weights Range:** 0.0 to 3.0
    - 0.0 = Ignore violations of this severity
    - 1.0 = Standard weight
    - 2.0+ = Harsh penalties
    """
    logger.info(f"Deep analysis requested for submission {submission_id}")
    
    try:
        result = await deep_analysis_service.run_deep_analysis(
            submission_id=submission_id,
            severity_weights=request.severity_weights,
            db=db
        )
        return DeepAnalysisResponse(**result)
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Deep analysis failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Deep analysis failed: {str(e)}"
        )


@router.get(
    "/{submission_id}/deep-results",
    response_model=DeepAnalysisResponse,
    summary="Get deep analysis results"
)
async def get_deep_analysis_results(
    submission_id: uuid.UUID,
    db: Session = Depends(get_db)
):
    """
    Retrieve previously computed deep analysis results.
    
    Returns the line-by-line analysis including:
    - Individual line scores
    - Relevance context for each line
    - Detailed rule impact breakdown
    - Severity configuration used (audit snapshot)
    """
    result = await deep_analysis_service.get_deep_analysis_results(
        submission_id=submission_id,
        db=db
    )
    
    if not result:
        raise HTTPException(
            status_code=404,
            detail="No deep analysis found for this submission. Run deep-analyze first."
        )
    
    return DeepAnalysisResponse(**result)


@router.get(
    "/{submission_id}/deep-analyze/presets",
    summary="Get severity weight presets"
)
async def get_severity_presets():
    """
    Get predefined severity weight presets for quick configuration.
    
    Available presets:
    - **strict**: Harsh penalties for all violations
    - **balanced**: Standard weighting
    - **lenient**: Reduced penalties, good for initial review
    """
    return {
        "presets": {
            "strict": {
                "critical": 2.0,
                "high": 1.5,
                "medium": 1.0,
                "low": 0.5,
                "description": "Harsh penalties - suitable for final review"
            },
            "balanced": {
                "critical": 1.5,
                "high": 1.0,
                "medium": 0.5,
                "low": 0.2,
                "description": "Standard weighting - recommended default"
            },
            "lenient": {
                "critical": 1.0,
                "high": 0.5,
                "medium": 0.2,
                "low": 0.1,
                "description": "Reduced penalties - good for initial drafts"
            }
        }
    }


@router.post(
    "/{submission_id}/deep-analyze/stream",
    summary="Stream deep analysis progress with live updates"
)
async def stream_deep_analysis(
    submission_id: uuid.UUID,
    request: DeepAnalysisRequest,
    db: Session = Depends(get_db)
):
    """
    Stream real-time progress during deep analysis.
    
    Returns Server-Sent Events (SSE) with:
    - progress: Current progress percentage
    - current_line: The line being analyzed
    - last_result: The last classified chunk with score
    - status: 'processing', 'complete', 'error'
    """
    
    async def generate_events():
        try:
            # Get submission
            submission = db.query(Submission).filter(
                Submission.id == submission_id
            ).first()
            
            if not submission:
                yield f"data: {json.dumps({'status': 'error', 'message': 'Submission not found'})}\n\n"
                return
            
            # Get check
            check = db.query(ComplianceCheck).filter(
                ComplianceCheck.submission_id == submission_id
            ).first()
            
            if not check:
                yield f"data: {json.dumps({'status': 'error', 'message': 'Compliance check not found'})}\n\n"
                return
            
            # Get active rules
            active_rules = db.query(Rule).filter(Rule.is_active == True).all()
            
            # Segment document
            content = submission.original_content or ""
            segments = deep_analysis_service.segment_document(content)
            total = len(segments)
            
            if total == 0:
                yield f"data: {json.dumps({'status': 'complete', 'message': 'No content to analyze', 'total_lines': 0})}\n\n"
                return
            
            severity_weights = request.severity_weights
            config_snapshot = severity_weights.model_dump()
            results = []
            
            # Send initial status
            yield f"data: {json.dumps({'status': 'started', 'total_lines': total, 'document_title': submission.title})}\n\n"
            await asyncio.sleep(0.1)
            
            # Process each line
            for i, segment in enumerate(segments):
                # Send progress update
                progress = {
                    'status': 'processing',
                    'progress': round((i / total) * 100, 1),
                    'current_index': i + 1,
                    'total_lines': total,
                    'current_line': {
                        'line_number': segment['line_number'],
                        'content': segment['line_content'][:100] + ('...' if len(segment['line_content']) > 100 else '')
                    }
                }
                yield f"data: {json.dumps(progress)}\n\n"
                
                # AI: Detect violations
                ai_result = await deep_analysis_service.detect_violations_with_ai(
                    line_content=segment["line_content"],
                    line_number=segment["line_number"],
                    document_context=submission.title,
                    active_rules=active_rules
                )
                
                # Calculate score
                line_score, impacts = deep_analysis_service.calculate_line_score(
                    base_score=100.0,
                    violations=ai_result.get("violations", []),
                    severity_weights=severity_weights
                )
                
                # Build result
                line_result = {
                    "line_number": segment["line_number"],
                    "line_content": segment["line_content"],
                    "line_score": round(line_score, 2),
                    "relevance_context": ai_result.get("relevance_context", ""),
                    "rule_impacts": [imp.model_dump() for imp in impacts]
                }
                results.append(line_result)
                
                # Send the classified result
                classified = {
                    'status': 'classified',
                    'progress': round(((i + 1) / total) * 100, 1),
                    'current_index': i + 1,
                    'total_lines': total,
                    'last_result': {
                        'line_number': segment['line_number'],
                        'content': segment['line_content'][:150] + ('...' if len(segment['line_content']) > 150 else ''),
                        'score': round(line_score, 2),
                        'relevance_context': ai_result.get("relevance_context", "")[:200],
                        'violations_count': len(impacts)
                    }
                }
                yield f"data: {json.dumps(classified)}\n\n"
            
            # Save to database
            from decimal import Decimal
            from ...models.deep_analysis import DeepAnalysis
            
            avg_score = sum(r["line_score"] for r in results) / len(results)
            scores = [r["line_score"] for r in results]
            
            # Delete existing
            db.query(DeepAnalysis).filter(DeepAnalysis.check_id == check.id).delete()
            
            # Create record
            deep_record = DeepAnalysis(
                check_id=check.id,
                total_lines=len(results),
                average_score=Decimal(str(round(avg_score, 2))),
                min_score=Decimal(str(round(min(scores), 2))),
                max_score=Decimal(str(round(max(scores), 2))),
                document_title=submission.title,
                severity_config_snapshot=config_snapshot,
                analysis_data=results
            )
            db.add(deep_record)
            db.commit()
            
            # Send completion
            complete = {
                'status': 'complete',
                'progress': 100,
                'total_lines': total,
                'average_score': round(avg_score, 2),
                'min_score': min(scores),
                'max_score': max(scores)
            }
            yield f"data: {json.dumps(complete)}\n\n"
            
        except Exception as e:
            logger.error(f"Stream error: {str(e)}")
            yield f"data: {json.dumps({'status': 'error', 'message': str(e)})}\n\n"
    
    return StreamingResponse(
        generate_events(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*"
        }
    )
