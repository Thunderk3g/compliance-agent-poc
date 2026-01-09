"""
Analytics Agent - BI Reasoning and Executive Insights

Specialist Focus: Agentic data analysis, trend detection, executive summaries
Runs "Reasoning Loops" on structured data from compliance checks, violations, and agent executions.
"""

import logging
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from datetime import datetime, timedelta
from enum import Enum

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
    generated_at: datetime


class AnalyticsAgent:
    """
    Agentic BI Analyst
    
    You don't just query data—you reason about it, detect patterns, 
    explain anomalies, and provide executive-ready insights.
    
    Reasoning Loop:
    1. Parse the query intent
    2. Plan data fetches
    3. Execute queries
    4. Analyze results
    5. Generate narrative
    """
    
    def __init__(self):
        self.db_session = None
        logger.info("AnalyticsAgent initialized")
    
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
            intent = await self._parse_intent(query)
            reasoning_steps.append(ReasoningStep(
                step=1,
                action="parsed_intent",
                result=intent
            ))
            
            # Step 2: Plan Queries
            query_plan = await self._plan_queries(intent)
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
            narrative = await self._generate_narrative(analysis, anomalies)
            reasoning_steps.append(ReasoningStep(
                step=6,
                action="generated_narrative",
                result="complete"
            ))
            
            result = AnalyticsInsight(
                query=query,
                reasoning_steps=reasoning_steps,
                metrics=analysis.get("metrics", {}),
                trends=analysis.get("trends", {}),
                anomalies=anomalies,
                narrative=narrative,
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
    
    async def _parse_intent(self, query: str) -> Dict[str, Any]:
        """
        Parse the user's query to determine analysis type.
        
        Tailored for Comparative Sales Analysis (AEM Data).
        """
        query_lower = query.lower()
        
        intent = {
            "type": "general",
            "period": TrendPeriod.MOM.value,
            "metrics": ["volume", "total_premium", "avg_ticket_size"],
            "focus": "compliance", # Default focus
            "filters": {}
        }
        
        # Detect sales focus
        if any(word in query_lower for word in ["sales", "product", "performance", "premium", "market"]):
            intent["focus"] = "sales"
        
        # Detect analysis type
        if "trend" in query_lower or "trending" in query_lower:
            intent["type"] = "trend_analysis"
        elif "anomal" in query_lower or "spike" in query_lower:
            intent["type"] = "anomaly_detection"
        elif "compare" in query_lower or "comparison" in query_lower or "vs" in query_lower:
            intent["type"] = "comparison"
        elif "summary" in query_lower or "report" in query_lower:
            intent["type"] = "executive_summary"
        
        # Detect time period
        if "quarter" in query_lower:
            intent["period"] = TrendPeriod.QOQ.value
        elif "year" in query_lower:
            intent["period"] = TrendPeriod.YOY.value
        elif "week" in query_lower:
            intent["period"] = TrendPeriod.WOW.value
        
        return intent
    
    async def _plan_queries(self, intent: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Plan which database queries to execute.
        """
        plans = []
        
        if intent["type"] in ["trend_analysis", "executive_summary", "general"]:
            plans.append({
                "table": "compliance_checks",
                "aggregation": "count_by_period",
                "period": intent["period"]
            })
            plans.append({
                "table": "violations",
                "aggregation": "count_by_category",
                "period": intent["period"]
            })
        
        if intent["type"] == "anomaly_detection":
            plans.append({
                "table": "agent_executions",
                "aggregation": "daily_metrics",
                "period": "last_30_days"
            })
        
        return plans
    
    async def _execute_queries(
        self, 
        query_plan: List[Dict[str, Any]], 
        db: Any
    ) -> Dict[str, Any]:
        """
        Execute planned queries against the database.
        
        Includes simulation of AEM Sales Data.
        """
        # Simulation of AEM Sales Data for Comparative Analysis
        aem_sales_data = {
            "source": "Adobe Experience Manager (AEM)",
            "last_sync": datetime.now().isoformat(),
            "products": [
                {
                    "name": "Term Life Insurance",
                    "premium_q3": 4500000,
                    "premium_q2": 3800000,
                    "volume_q3": 1200,
                    "volume_q2": 1050,
                    "market_share": 0.35
                },
                {
                    "name": "Health Guard Plus",
                    "premium_q3": 3200000,
                    "premium_q2": 2900000,
                    "volume_q3": 950,
                    "volume_q2": 880,
                    "market_share": 0.25
                },
                {
                    "name": "ULIP Wealth Creator",
                    "premium_q3": 5800000,
                    "premium_q2": 6200000,
                    "volume_q3": 450,
                    "volume_q2": 510,
                    "market_share": 0.40
                }
            ]
        }
        
        # Keep existing compliance placeholders for fallback
        compliance_data = {
            "compliance_checks": {
                "current_period": 1245,
                "previous_period": 1102,
                "compliance_rate": 87.3,
                "previous_compliance_rate": 82.1
            },
            "violations": {
                "total": 158,
                "by_severity": {"critical": 12, "major": 45, "minor": 101},
                "by_category": {"irdai": 78, "brand": 45, "seo": 35}
            }
        }
        
        return {
            "sales_data": aem_sales_data,
            "compliance_data": compliance_data
        }
    
    async def _analyze_data(
        self, 
        raw_data: Dict[str, Any],
        intent: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Analyze the raw data to extract insights.
        """
        if intent.get("focus") == "sales":
            sales_data = raw_data.get("sales_data", {})
            products = sales_data.get("products", [])
            
            if not products:
                return {"focus": "sales", "error": "No sales data found"}
                
            # Comparative analysis
            top_performer = max(products, key=lambda x: x["premium_q3"])
            fastest_grower = max(products, key=lambda x: (x["premium_q3"] - x["premium_q2"]) / x["premium_q2"])
            
            metrics = {
                "total_q3_premium": sum(p["premium_q3"] for p in products),
                "top_product": top_performer["name"],
                "growth_star": fastest_grower["name"]
            }
            
            trends = {
                "market_share_distribution": {p["name"]: p["market_share"] for p in products},
                "growth_rates": {p["name"]: (p["premium_q3"] - p["premium_q2"]) / p["premium_q2"] for p in products}
            }
            
            return {
                "focus": "sales",
                "metrics": metrics,
                "trends": trends,
                "raw_products": products
            }
        else:
            # Fallback to compliance analysis
            comp_data = raw_data.get("compliance_data", {}).get("compliance_checks", {})
            violations = raw_data.get("compliance_data", {}).get("violations", {})
            return {
                "focus": "compliance",
                "metrics": {
                    "total_submissions": comp_data.get("current_period", 0),
                    "compliance_rate": comp_data.get("compliance_rate", 0),
                    "critical_violations": violations.get("by_severity", {}).get("critical", 0),
                },
                "trends": {
                    "compliance_rate_change": comp_data.get("compliance_rate", 0) - comp_data.get("previous_compliance_rate", 0),
                    "direction": "improving" if (comp_data.get("compliance_rate", 0) - comp_data.get("previous_compliance_rate", 0)) > 0 else "declining"
                }
            }
    
    async def _detect_anomalies(self, raw_data: Dict[str, Any]) -> List[Anomaly]:
        """
        Detect statistical anomalies in the data.
        
        Uses simple threshold-based detection.
        TODO: Implement Z-score/IQR for production.
        """
        anomalies = []
        
        violations = raw_data.get("violations", {})
        critical = violations.get("by_severity", {}).get("critical", 0)
        
        # Flag if critical violations exceed expected threshold
        expected_critical = 5  # Baseline
        if critical > expected_critical * 2:
            anomalies.append(Anomaly(
                metric="critical_violations",
                period="current",
                value=critical,
                expected=expected_critical,
                deviation=2.5,
                probable_cause="Possible new IRDAI circular or rule changes"
            ))
        
        return anomalies
    
    async def _generate_narrative(
        self, 
        analysis: Dict[str, Any],
        anomalies: List[Anomaly]
    ) -> str:
        """
        Generate executive-ready narrative summary.
        """
        if analysis.get("focus") == "sales":
            metrics = analysis.get("metrics", {})
            trends = analysis.get("trends", {})
            
            narrative = f"### Comparative Sales Analysis (Source: AEM Data)\n\n"
            narrative += f"• **Total Premium (Q3):** ₹{metrics['total_q3_premium']:,.0f} showing a healthy quarter-over-quarter trajectory.\n"
            narrative += f"• **Top Performer:** {metrics['top_product']} remains the market leader with a share of {(trends['market_share_distribution'][metrics['top_product']]*100):.1f}%.\n"
            narrative += f"• **Growth Insight:** {metrics['growth_star']} is the fastest-growing product, increasing by {(trends['growth_rates'][metrics['growth_star']]*100):.1f}% compared to Q2.\n"
            narrative += f"• **Notable Pattern:** While most products show growth, ULIP Wealth Creator saw a decline in volume, suggesting a shift in customer preference towards lower-risk term plans.\n"
            
            if anomalies:
                narrative += f"\n**Anomalies Detected:** {anomalies[0].metric} fluctuated significantly in the last period."
                
            return narrative.strip()
        else:
            # Placeholder narrative generation for compliance
            metrics = analysis.get("metrics", {})
            trends = analysis.get("trends", {})
            
            direction = trends.get("direction", "stable")
            change = abs(trends.get("compliance_rate_change", 0))
            
            narrative = f"Compliance {direction} by {change:.1f}% this period. "
            narrative += f"Processed {metrics.get('total_submissions', 0)} submissions "
            narrative += f"with {metrics.get('critical_violations', 0)} critical violations. "
            
            if anomalies:
                narrative += f"Alert: {len(anomalies)} anomaly detected - {anomalies[0].probable_cause}. "
            
            # Recommendation
            if direction == "declining":
                narrative += "Recommend: Review recent rule changes and team training."
            elif metrics.get("critical_violations", 0) > 10:
                narrative += "Recommend: Prioritize critical violation resolution."
            else:
                narrative += "Recommend: Continue current practices."
            
            return narrative

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
