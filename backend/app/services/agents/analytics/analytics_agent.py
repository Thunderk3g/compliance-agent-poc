"""
Analytics Agent - BI Reasoning and Executive Insights

Specialist Focus: Agentic data analysis, trend detection, executive summaries
Runs "Reasoning Loops" on structured data from compliance checks, violations, and agent executions.
"""

import logging
import json
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from datetime import datetime, timedelta
from enum import Enum
from sqlalchemy.orm import Session
from sqlalchemy import text, func
from app.models import ComplianceCheck, Violation, VoiceReport, Policy, Dataset
from app.services.llm_service import llm_service

from langsmith import traceable

logger = logging.getLogger(__name__)


class TrendPeriod(Enum):
    """Supported trend comparison periods."""
    WOW = "week_over_week"
    MOM = "month_over_month"
    QOQ = "quarter_over_quarter"
    YOY = "year_over_year"


class Anomaly(BaseModel):
    """Detected anomaly in metrics."""
    metric: str
    period: str
    value: float
    expected: float
    deviation: float  # Standard deviations from mean
    probable_cause: Optional[str] = None


class ReasoningStep(BaseModel):
    """Step in the reasoning loop."""
    step: int
    action: str
    result: Any


class AnalyticsInsight(BaseModel):
    """Complete analytics response."""
    query: str
    reasoning_steps: List[ReasoningStep]
    metrics: Dict[str, Any]
    trends: Dict[str, Any]
    anomalies: List[Anomaly]
    narrative: str
    chart_config: Optional[Dict[str, Any]] = None
    key_insights: List[str] = []
    generated_at: datetime


class AnalyticsAgent:
    """
    Agentic BI Analyst
    
    You don't just query data—you reason about it, detect patterns, 
    explain anomalies, and provide executive-ready insights.
    
    Reasoning Loop:
    1. Parse the query intent (LLM)
    2. Plan data fetches
    3. Execute queries
    4. Analyze results
    5. Generate narrative (LLM)
    """
    
    def __init__(self, llm_service=llm_service):
        self.db_session = None
        self.llm = llm_service
        logger.info("AnalyticsAgent initialized with LLM Service")
    
    @traceable(name="Analytics Agent: Reasoning Loop", run_type="chain")
    async def reason(
        self, 
        input_data: Dict[str, Any],
        **kwargs
    ) -> Dict[str, Any]:
        """
        Main entry point for analytics reasoning.
        
        Args:
            input_data: Contains analytics_query or insight_request
            
        Returns:
            AnalyticsInsight as dictionary
        """
        query = input_data.get("analytics_query", input_data.get("insight_request", ""))
        db = kwargs.get("db")
        
        reasoning_steps = []
        
        try:
            # Step 1: Parse Intent
            dataset_id = input_data.get("dataset_id")
            dataset_schema = None
            if dataset_id and db:
                 dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
                 if dataset:
                     dataset_schema = dataset.schema_metadata

            intent = await self._parse_intent(query, dataset_schema)
            reasoning_steps.append(ReasoningStep(
                step=1,
                action="parsed_intent",
                result=intent
            ))
            
            # Step 2: Plan Queries
            query_plan = await self._plan_queries(intent, dataset_id)
            reasoning_steps.append(ReasoningStep(
                step=2,
                action="planned_queries",
                result=query_plan
            ))
            
            # Step 3: Execute Queries
            raw_data = await self._execute_queries(query_plan, db)
            reasoning_steps.append(ReasoningStep(
                step=3,
                action="executed_queries",
                result={"tables_queried": list(raw_data.keys())}
            ))
            
            # Step 4: Analyze Data
            analysis = await self._analyze_data(raw_data, intent)
            reasoning_steps.append(ReasoningStep(
                step=4,
                action="analyzed_data",
                result=analysis
            ))
            
            # Step 5: Detect Anomalies
            anomalies = await self._detect_anomalies(raw_data)
            reasoning_steps.append(ReasoningStep(
                step=5,
                action="detected_anomalies",
                result={"count": len(anomalies)}
            ))
            
            # Step 6: Generate Narrative
            llm_output_str = await self._generate_narrative(analysis, anomalies)
            reasoning_steps.append(ReasoningStep(
                step=6,
                action="generated_narrative",
                result="complete"
            ))
            
            # Parse LLM Output
            import json
            try:
                llm_data = json.loads(llm_output_str)
                narrative_text = llm_data.get("summary", "Analysis complete.")
                chart_config = {
                    "type": llm_data.get("chart_type"),
                    "data": llm_data.get("chart_data")
                } if llm_data.get("chart_type") else None
                key_insights = llm_data.get("key_insights", [])
            except:
                narrative_text = llm_output_str
                chart_config = None
                key_insights = []
            
            result = AnalyticsInsight(
                query=query,
                reasoning_steps=reasoning_steps,
                metrics=analysis.get("metrics", {}),
                trends=analysis.get("trends", {}),
                anomalies=anomalies,
                narrative=narrative_text,
                chart_config=chart_config,
                key_insights=key_insights,
                generated_at=datetime.now()
            )
            
            return result.model_dump(mode="json")
            
        except Exception as e:
            logger.error(f"Analytics reasoning failed: {e}")
            return {
                "query": query,
                "error": str(e),
                "reasoning_steps": [s.model_dump() for s in reasoning_steps],
                "status": "failed"
            }
    
    @traceable(name="Analytics Agent: Parse Intent", run_type="chain")
    async def _parse_intent(self, query: str, schema: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Use LLM to understand what the user is asking.
        """
        schema_text = ""
        if schema:
            schema_text = f"\n        - 'dataset': Uploaded dataset with columns: {json.dumps(schema.get('columns', []))}"

        prompt = f"""
        You are an expert BI Analyst. Analyze the user's query to determine the intent, focus, and required data.
        
        Query: "{query}"
        
        Available Data Sources:
        - "sales": Insurance policy sales, premiums, products, growth.
        - "compliance": Regulatory compliance scores, violations, check volume.
        - "voice": Call center audit, risk scores, sentiment analysis.{schema_text}
        
        Task:
        Return a JSON object with:
        - "focus": One of ["sales", "compliance", "voice", "dataset"] (default to "dataset" if query refers to uploaded columns, else "general")
        - "type": One of ["trend", "comparison", "summary", "anomaly"]
        - "period": One of ["week", "month", "quarter", "year"] (infer from context or default to "month")
        - "metric": (If focus is dataset) The column name to aggregate (e.g. "SalesAmount")
        - "group_by": (If focus is dataset) List of columns to group by (e.g. ["Region"])
        - "filters": Key-value pairs of any specific filters mentioned (e.g., product="Term Life")
        
        Only return the JSON.
        """
        
        try:
            response = await self.llm.generate_response(prompt, temperature=0.0)
            # Basic cleaning if LLM wraps in markdown
            response = response.replace("```json", "").replace("```", "").strip()
            
            intent = json.loads(response)
            
            # Fallback defaults if LLM misses keys
            if "focus" not in intent: intent["focus"] = "compliance"
            if "type" not in intent: intent["type"] = "summary"
            if "period" not in intent: intent["period"] = "month"
            
            return intent
        except Exception as e:
            logger.error(f"LLM Intent Parsing failed: {e}")
            logger.error(f"Raw Response was: {response if 'response' in locals() else 'None'}")
            # Fallback to heuristic
            return {
                "focus": "compliance",
                "type": "summary",
                "period": "month",
                "filters": {}
            }
    
    @traceable(name="Analytics Agent: Plan Queries", run_type="chain")
    async def _plan_queries(self, intent: Dict[str, Any], dataset_id: str = None) -> Dict[str, Any]:
        """
        Translate intent into data requirements.
        """
        required_data = []
        plan = {}
        
        focus = intent.get("focus", "compliance")
        
        if focus == "dataset" and dataset_id:
             required_data.append("dataset")
             plan["dataset_id"] = dataset_id
             plan["metric"] = intent.get("metric")
             plan["group_by"] = intent.get("group_by", [])
        elif focus == "sales":
            required_data.append("sales")
        elif focus == "voice":
             required_data.append("voice")
        else:
             # Default to compliance
             required_data.append("compliance")
             
        # Anomaly detection might need all data
        if intent.get("type") == "anomaly_detection":
             if "compliance" not in required_data: required_data.append("compliance")
        
        plan["required_data"] = required_data
        plan["period"] = intent.get("period", "month")
        
        return plan
    
    @traceable(name="Analytics Agent: Execute Queries", run_type="chain")
    async def _execute_queries(self, plan: Dict[str, Any], db: Session) -> Dict[str, Any]:
        """
        Execute multiple planned queries and combine results.
        """
        results = {}
        
        # Sales Data (Policy Table)
        if "sales" in plan.get("required_data", []):
            try:
                # Query: Sum premium by period and product
                query = text("""
                    SELECT 
                        to_char(issue_date, 'YYYY-MM') as period,
                        product,
                        SUM(premium) as total
                    FROM policies
                    GROUP BY 1, 2
                    ORDER BY 1
                """)
                rows = db.execute(query).fetchall()
                results["sales_data"] = [{"period": r[0], "product": r[1], "total": r[2]} for r in rows]
            except Exception as e:
                logger.error(f"Sales Query Error: {e}")
                results["sales_data"] = []

        # Compliance Data (ComplianceCheck Table)
        if "compliance" in plan.get("required_data", []):
             try:
                # Stats
                checks = db.query(ComplianceCheck.check_date, ComplianceCheck.overall_score).limit(100).all()
                results["compliance_stats"] = [
                    {"check_date": c.check_date.isoformat(), "overall_score": float(c.overall_score or 0)} 
                    for c in checks
                ]
                
                # Violations
                v_query = text("""
                    SELECT severity, category, count(*) as count 
                    FROM violations 
                    GROUP BY severity, category
                """)
                v_rows = db.execute(v_query).fetchall()
                results["violation_stats"] = [
                    {"severity": r[0], "category": r[1], "count": r[2]} for r in v_rows
                ]
             except Exception as e:
                 logger.error(f"Compliance Query Error: {e}")
                 results["compliance_stats"] = []
                 results["violation_stats"] = []

        # Generic Dataset Data
        if "dataset_id" in plan:
            try:
                dataset_id = plan["dataset_id"]
                metric = plan.get("metric", "count")
                group_by = plan.get("group_by", [])
                
                # Construct JSONB query
                # Assumes 'data' column in dataset_rows
                # Example: SELECT data->>'Region', SUM((data->>'Sales')::float) ...
                
                select_clauses = []
                group_by_clauses = []
                
                for idx, col in enumerate(group_by):
                    select_clauses.append(f"data->>'{col}' as col_{idx}")
                    group_by_clauses.append(str(idx + 1))
                
                if not select_clauses: # If no group by, checking global stats
                     select_clauses.append("'Global'")
                
                # Metric aggregation
                # Try to cast to float for summation, fallback to count
                if metric == "count":
                    select_clauses.append("count(*) as val")
                else:
                    # e.g. sum(sales)
                    # We need to be careful about SQL injection here if taking raw strings, 
                    # but metric comes from agent plan.
                    select_clauses.append(f"SUM(COALESCE((data->>'{metric}')::float, 0)) as val")
                
                select_str = ", ".join(select_clauses)
                group_by_str = f"GROUP BY {', '.join(group_by_clauses)}" if group_by_clauses else ""
                
                query_str = f"""
                    SELECT {select_str}
                    FROM dataset_rows
                    WHERE dataset_id = :dataset_id
                    {group_by_str}
                    LIMIT 100
                """
                
                rows = db.execute(text(query_str), {"dataset_id": dataset_id}).fetchall()
                
                # Format results: [{"col_0": "North", "val": 1000}, ...]
                formatted_rows = []
                for r in rows:
                    row_dict = {"value": r[-1]} # Last col is always the value
                    for i, col_name in enumerate(group_by):
                        row_dict[col_name] = r[i]
                    formatted_rows.append(row_dict)
                    
                results["generic_data"] = formatted_rows
                logger.info(f"Executed generic query. Rows: {len(formatted_rows)}")
            
            except Exception as e:
                logger.error(f"Generic Dataset Query Error: {e}")
                results["generic_data"] = []

        # Voice Data (VoiceReport Table)
        if "voice" in plan.get("required_data", []):
            try:
                 reports = db.query(VoiceReport.risk_score).limit(50).all()
                 results["voice_stats"] = [
                     {"risk_score": r.risk_score} for r in reports
                 ]
            except Exception as e:
                 logger.error(f"Voice Query Error: {e}")
                 results["voice_stats"] = []

        return results
    
    async def _analyze_sales_data(self, raw_data: Dict[str, Any], intent: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze Policy sales data."""
        raw = raw_data.get("sales_data", [])
        if not raw:
            return {
                "focus": "sales",
                "metrics": {"total_sales": 0, "top_product": "N/A"},
                "trends": {"sales_trend": "No Data"}
            }

        # Basic aggregation
        total_premium = sum(r["total"] for r in raw)
        
        # Trend
        periods = sorted(list(set(r["period"] for r in raw)))
        latest_period = periods[-1] if periods else None
        
        # Product split
        product_totals = {}
        for r in raw:
            p = r["product"]
            product_totals[p] = product_totals.get(p, 0) + r["total"]
            
        top_product = max(product_totals.items(), key=lambda x: x[1])[0] if product_totals else "N/A"
        
        return {
            "focus": "sales",
            "metrics": {
                "total_sales": total_premium,
                "top_product": top_product,
                "latest_period": latest_period
            },
            "trends": {
                "market_share": product_totals,
                "periods": periods
            },
            "raw_data": raw
        }

    async def _analyze_compliance_data(self, raw_data: Dict[str, Any], intent: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze ComplianceCheck and Violation data."""
        checks = raw_data.get("compliance_stats", [])
        violations = raw_data.get("violation_stats", [])
        
        # Compliance Metrics
        total_checks = len(checks)
        avg_score = sum(c["overall_score"] for c in checks) / total_checks if total_checks else 0
        
        scores_by_date = {}
        for c in checks:
            d = c["check_date"].split("T")[0]
            scores_by_date[d] = c["overall_score"]
            
        # Violation Metrics
        violation_counts = {"critical": 0, "high": 0, "medium": 0, "low": 0}
        for v in violations:
            sev = v["severity"].lower()
            if sev in violation_counts:
                violation_counts[sev] += v["count"]
                
        return {
            "focus": "compliance",
            "metrics": {
                "total_checks": total_checks,
                "avg_compliance_score": round(avg_score, 2),
                "critical_violations": violation_counts["critical"]
            },
            "trends": {
                "score_history": scores_by_date,
                "violation_breakdown": violation_counts
            }
        }

    async def _analyze_voice_data(self, raw_data: Dict[str, Any], intent: Dict[str, Any]) -> Dict[str, Any]:
         """Analyze VoiceReport data."""
         reports = raw_data.get("voice_stats", [])
         
         avg_risk = 0
         if reports:
             avg_risk = sum(r["risk_score"] for r in reports if r["risk_score"] is not None) / len(reports)
             
         return {
             "focus": "voice",
             "metrics": {
                 "total_calls": len(reports),
                 "avg_risk_score": round(avg_risk, 2)
             },
             "trends": {}
         }

    @traceable(name="Analytics Agent: Analyze Generic Dataset", run_type="chain")
    async def _analyze_generic_data(self, raw_data: Dict[str, Any], intent: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generic analyzer for dataset_rows (JSONB).
        """
        data = raw_data.get("generic_data", [])
        return {
            "focus": "dataset",
            "metrics": {
                "row_count": len(data),
                "total_value": sum(r["value"] for r in data) if data else 0
            },
            "trends": {
                "data_points": data
            },
            "raw_data": data
        }

    @traceable(name="Analytics Agent: Analyze Data", run_type="chain")
    async def _analyze_data(self, raw_data: Dict[str, Any], intent: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform arithmetic and statistical analysis on raw results.
        """
        focus = intent.get("focus", "general")
        
        if focus == "dataset" or (raw_data.get("generic_data") is not None and len(raw_data.get("generic_data", [])) > 0):
             return await self._analyze_generic_data(raw_data, intent)
        elif focus == "sales":
            return await self._analyze_sales_data(raw_data, intent)
        elif focus == "voice":
            return await self._analyze_voice_data(raw_data, intent)
        else:
            return await self._analyze_compliance_data(raw_data, intent)
    
    async def _detect_anomalies(self, raw_data: Dict[str, Any]) -> List[Anomaly]:
        """Simple anomaly detection on real data."""
        anomalies = []
        
        # Check for Critical Violation Spikes
        v_stats = raw_data.get("violation_stats", [])
        critical_count = sum(v["count"] for v in v_stats if v["severity"] == "critical")
        
        if critical_count > 5:
             anomalies.append(Anomaly(
                metric="critical_violations",
                period="current",
                value=critical_count,
                expected=2,
                deviation=critical_count/2.0,
                probable_cause="High number of critical violations detected"
            ))
            
        return anomalies
    
    @traceable(name="Analytics Agent: Generate Narrative", run_type="chain")
    async def _generate_narrative(self, analysis: Dict[str, Any], anomalies: List[Anomaly], intent: Dict[str, Any] = {}) -> str:
        """
        Generate executive-ready narrative and visualization config using LLM.
        """
        focus = analysis.get("focus", "general")
        metrics = analysis.get("metrics", {})
        trends = analysis.get("trends", {})
        raw_data = analysis.get("raw_data", [])
        
        # Construct data context for LLM
        data_summary = f"Focus: {focus}\nMetrics: {json.dumps(metrics)}\nTrends: {json.dumps(trends)}\nIntent: {json.dumps(intent)}"
        if anomalies:
            data_summary += f"\nAnomalies: {[a.dict() for a in anomalies]}"
            
        prompt = f"""
        You are a Chief Data Officer. Based on the following data analysis, provide an executive summary and recommend a visualization.
        
        Data Context:
        {data_summary}
        
        Task:
        1. Write a professional, concise executive summary (markdown format). Highlight key wins, risks, and trends.
           If the focus is 'dataset', speak specifically about the uploaded data trends.
        2. Recommend the single best chart to visualize this data (bar, line, area, or pie).
        3. Provide the chart configuration for ApexCharts (series and xaxis categories).
           For 'dataset' focus, use the trends data provided to build the series.
        
        Output Format:
        Return ONLY a raw JSON object (no markdown formatting) with this structure:
        {{
            "summary": "Your executive summary here...",
            "chart_type": "bar",  // or line, area, pie
            "chart_data": {{
                "series": [ {{ "name": "Series Name", "data": [10, 20, 30] }} ],
                "xaxis": {{ "categories": ["Jan", "Feb", "Mar"] }}
            }},
            "key_insights": ["Insight 1", "Insight 2"]
        }}
        """
        
        try:
            response = await self.llm.generate_response(prompt, temperature=0.2)
            # Clean response
            response = response.replace("```json", "").replace("```", "").strip()
            
            # Verify it's valid JSON
            json.loads(response)
            return response
            
        except Exception as e:
            logger.error(f"LLM Narrative Generation failed: {e}")
            # Fallback basics
            return json.dumps({
                "summary": f"{focus.capitalize()} analysis completed. Metrics: {metrics}",
                "chart_type": "bar",
                "chart_data": {"series": [], "xaxis": {"categories": []}},
                "key_insights": []
            })

    # Connector Methods (Power BI-style API)
    
    async def get_submission_trends(
        self, 
        period: str = "month",
        db: Any = None
    ) -> Dict[str, Any]:
        """Get submissions per day/week/month with status breakdown."""
        # TODO: Implement actual query
        return await self._execute_queries([{
            "table": "compliance_checks",
            "aggregation": "count_by_period",
            "period": period
        }], db)
    
    async def get_violation_heatmap(
        self, 
        project_id: Optional[str] = None,
        db: Any = None
    ) -> Dict[str, Any]:
        """Get most common violations by category and severity."""
        # TODO: Implement actual query
        return {
            "heatmap": [
                {"category": "irdai", "severity": "critical", "count": 12},
                {"category": "irdai", "severity": "major", "count": 45},
                {"category": "brand", "severity": "minor", "count": 30}
            ]
        }
    
    async def get_agent_performance(self, db: Any = None) -> Dict[str, Any]:
        """Get LLM token usage, response times, accuracy."""
        # TODO: Implement actual query
        return {
            "total_tokens": 450000,
            "avg_response_time_ms": 2340,
            "success_rate": 98.5,
            "cost_estimate_usd": 0.45
        }
