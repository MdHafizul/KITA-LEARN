-- PostgreSQL initialization script for LMS
-- This runs automatically when the container starts

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enable query logging for performance monitoring
ALTER SYSTEM SET log_statement = 'none';
ALTER SYSTEM SET log_min_duration_statement = 1000; -- Log queries taking > 1 second

-- Performance optimization
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET work_mem = '10MB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';

-- Connection pooling recommendation (use PgBouncer in production)
ALTER SYSTEM SET max_connections = 100;

-- Log
SELECT pg_reload_conf();

-- Grant permissions
GRANT USAGE ON SCHEMA public TO lms_admin;
GRANT CREATE ON SCHEMA public TO lms_admin;

-- Create indexes for frequent queries (will be created by Prisma migrations)
-- This is just a reference for what will be auto-created

COMMENT ON DATABASE lms_db IS 'KitaLearn Learning Management System Database';
