#!/bin/bash
# =============================================================================
# PostgreSQL Initialization Script
# =============================================================================
# This runs automatically on first container start

# Enable extensions needed for the compliance system
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Enable pgvector for similarity search
    CREATE EXTENSION IF NOT EXISTS vector;
    
    -- Enable pg_trgm for fuzzy text search
    CREATE EXTENSION IF NOT EXISTS pg_trgm;
    
    -- Enable btree_gist for exclusion constraints
    CREATE EXTENSION IF NOT EXISTS btree_gist;
    
    -- Performance tuning (these apply to the session)
    -- For persistent settings, modify postgresql.conf
    
    -- Log slow queries (adjust threshold as needed)
    ALTER SYSTEM SET log_min_duration_statement = '1000';
    
    -- Better query planning stats
    ALTER SYSTEM SET default_statistics_target = '100';
    
    -- Reload config
    SELECT pg_reload_conf();
EOSQL

echo "✅ PostgreSQL extensions and settings initialized"
