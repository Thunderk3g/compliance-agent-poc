from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
from .config import settings
from .api.routes import submissions, compliance, dashboard, admin, preprocessing, onboarding, projects
from .services.llm_service import llm_service

# Configure logging
logging.basicConfig(
    level=settings.log_level,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    logger.info("Starting Compliance Agent Backend")

    # Check LLM connection
    llm_healthy = await llm_service.health_check()

    if llm_healthy:
        logger.info("✅ LLM service is available")
    else:
        logger.warning("⚠️ LLM service is not available - using fallback responses")

    # Initialize Graph (warmup)
    try:
        from .services.agents.orchestrator import orchestrator
        logger.info("Compliance Graph initialized")
    except ImportError as e:
        logger.warning(f"Failed to import orchestrator: {e}")
    except Exception as e:
        logger.warning(f"Failed to initialize Compliance Graph: {e}")

    yield

    # Shutdown
    logger.info("Shutting down Compliance Agent Backend")


# Create FastAPI app
app = FastAPI(
    title="Compliance Agent API",
    description="AI-powered compliance checking for marketing content",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.api_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from .api.middleware import AuthenticationMiddleware
app.add_middleware(AuthenticationMiddleware)

# Include routers
app.include_router(submissions.router)
app.include_router(compliance.router)
app.include_router(dashboard.router)
app.include_router(admin.router)  # Phase 2: Admin routes for rule management
app.include_router(preprocessing.router)  # Phase 3: Chunked content processing
app.include_router(onboarding.router)  # Adaptive Engine: User onboarding
app.include_router(projects.router)  # Phase 1: Project System
 
from strawberry.fastapi import GraphQLRouter
from .graphql.schema import schema

graphql_app = GraphQLRouter(schema)
app.include_router(graphql_app, prefix="/graphql")


# Health check
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    llm_status = await llm_service.health_check()

    return {
        "status": "healthy",
        "llm_available": llm_status
    }


@app.get("/")
def root():
    """Root endpoint."""
    return {
        "message": "Compliance Agent API",
        "docs": "/docs",
        "version": "1.0.0"
    }
