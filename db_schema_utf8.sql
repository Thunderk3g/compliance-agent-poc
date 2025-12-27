--
-- PostgreSQL database dump
--

\restrict My6Mdk6vtXuyKifs6KZTLvENQHlBISC1ybfff7mrujSm7qYs7RT1w7RFh9JZnyE

-- Dumped from database version 15.14
-- Dumped by pg_dump version 15.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: agent_executions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.agent_executions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    agent_type character varying(50) NOT NULL,
    session_id uuid NOT NULL,
    user_id uuid,
    status character varying(20) DEFAULT 'running'::character varying,
    input_data jsonb,
    output_data jsonb,
    started_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone,
    total_tokens_used integer DEFAULT 0,
    execution_time_ms integer
);


--WAC
-- Name: agent_metrics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.agent_metrics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    date date NOT NULL,
    agent_type character varying(50) NOT NULL,
    tool_name character varying(100),
    total_invocations integer DEFAULT 0,
    total_tokens integer DEFAULT 0,
    total_execution_time_ms integer DEFAULT 0,
    total_cost_usd numeric(10,6) DEFAULT '0'::numeric
);


--
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


--
-- Name: compliance_checks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.compliance_checks (
    id uuid NOT NULL,
    submission_id uuid,
    check_date timestamp with time zone DEFAULT now(),
    overall_score numeric(5,2),
    irdai_score numeric(5,2),
    brand_score numeric(5,2),
    seo_score numeric(5,2),
    status character varying(50),
    ai_summary text,
    grade character varying(2)
);


--
-- Name: deep_analysis; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.deep_analysis (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    check_id uuid NOT NULL,
    total_lines numeric(10,0) DEFAULT '0'::numeric,
    average_score numeric(5,2) DEFAULT 100.00,
    min_score numeric(5,2) DEFAULT 100.00,
    max_score numeric(5,2) DEFAULT 100.00,
    document_title text,
    severity_config_snapshot jsonb NOT NULL,
    analysis_data jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    status text DEFAULT 'pending'::text
);


--
-- Name: TABLE deep_analysis; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.deep_analysis IS 'Stores complete deep analysis for a submission as a single JSON document';


--
-- Name: knowledge_base; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.knowledge_base (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    country_code character varying(10) NOT NULL,
    regulation_name character varying(255) NOT NULL,
    document_title character varying(500),
    content text NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: rules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rules (
    id uuid NOT NULL,
    category character varying(20) NOT NULL,
    rule_text text NOT NULL,
    severity character varying(20) NOT NULL,
    keywords jsonb,
    pattern character varying(1000),
    is_active boolean,
    created_at timestamp with time zone DEFAULT now(),
    points_deduction numeric(5,2) DEFAULT '-5.00'::numeric NOT NULL,
    created_by uuid
);


--
-- Name: COLUMN rules.points_deduction; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.rules.points_deduction IS 'Point deduction value for compliance score calculation. Negative values indicate penalties.';


--
-- Name: COLUMN rules.created_by; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.rules.created_by IS 'UUID of the super admin who created this rule. NULL for system-seeded rules.';


--
-- Name: submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.submissions (
    id uuid NOT NULL,
    title character varying(500) NOT NULL,
    content_type character varying(50) NOT NULL,
    original_content text,
    file_path character varying(1000),
    submitted_by uuid,
    submitted_at timestamp with time zone DEFAULT now(),
    status character varying(50)
);


--
-- Name: tool_invocations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tool_invocations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    execution_id uuid NOT NULL,
    tool_name character varying(100) NOT NULL,
    is_premium boolean DEFAULT false,
    input_data jsonb,
    output_data jsonb,
    tokens_used integer DEFAULT 0,
    execution_time_ms integer,
    cost_usd numeric(10,6) DEFAULT '0'::numeric,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    role character varying(50),
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: violations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.violations (
    id uuid NOT NULL,
    check_id uuid,
    rule_id uuid,
    severity character varying(20) NOT NULL,
    category character varying(20) NOT NULL,
    description text NOT NULL,
    location character varying(500),
    current_text text,
    suggested_fix text,
    is_auto_fixable boolean
);


--
-- Name: agent_executions agent_executions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agent_executions
    ADD CONSTRAINT agent_executions_pkey PRIMARY KEY (id);


--
-- Name: agent_metrics agent_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agent_metrics
    ADD CONSTRAINT agent_metrics_pkey PRIMARY KEY (id);


--
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- Name: compliance_checks compliance_checks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.compliance_checks
    ADD CONSTRAINT compliance_checks_pkey PRIMARY KEY (id);


--
-- Name: deep_analysis deep_analysis_check_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deep_analysis
    ADD CONSTRAINT deep_analysis_check_id_key UNIQUE (check_id);


--
-- Name: deep_analysis deep_analysis_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deep_analysis
    ADD CONSTRAINT deep_analysis_pkey PRIMARY KEY (id);


--
-- Name: knowledge_base knowledge_base_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.knowledge_base
    ADD CONSTRAINT knowledge_base_pkey PRIMARY KEY (id);


--
-- Name: rules rules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rules
    ADD CONSTRAINT rules_pkey PRIMARY KEY (id);


--
-- Name: submissions submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_pkey PRIMARY KEY (id);


--
-- Name: tool_invocations tool_invocations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tool_invocations
    ADD CONSTRAINT tool_invocations_pkey PRIMARY KEY (id);


--
-- Name: agent_metrics uq_agent_metrics_date_type_tool; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agent_metrics
    ADD CONSTRAINT uq_agent_metrics_date_type_tool UNIQUE (date, agent_type, tool_name);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: violations violations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.violations
    ADD CONSTRAINT violations_pkey PRIMARY KEY (id);


--
-- Name: ix_agent_executions_agent_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_agent_executions_agent_type ON public.agent_executions USING btree (agent_type);


--
-- Name: ix_agent_executions_session_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_agent_executions_session_id ON public.agent_executions USING btree (session_id);


--
-- Name: ix_agent_executions_started_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_agent_executions_started_at ON public.agent_executions USING btree (started_at);


--
-- Name: ix_agent_metrics_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_agent_metrics_date ON public.agent_metrics USING btree (date);


--
-- Name: ix_compliance_checks_check_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_compliance_checks_check_date ON public.compliance_checks USING btree (check_date);


--
-- Name: ix_deep_analysis_check_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_deep_analysis_check_id ON public.deep_analysis USING btree (check_id);


--
-- Name: ix_knowledge_base_country; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_knowledge_base_country ON public.knowledge_base USING btree (country_code);


--
-- Name: ix_knowledge_base_regulation; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_knowledge_base_regulation ON public.knowledge_base USING btree (regulation_name);


--
-- Name: ix_rules_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_rules_category ON public.rules USING btree (category);


--
-- Name: ix_rules_created_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_rules_created_by ON public.rules USING btree (created_by);


--
-- Name: ix_rules_severity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_rules_severity ON public.rules USING btree (severity);


--
-- Name: ix_tool_invocations_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_tool_invocations_created_at ON public.tool_invocations USING btree (created_at);


--
-- Name: ix_tool_invocations_is_premium; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_tool_invocations_is_premium ON public.tool_invocations USING btree (is_premium);


--
-- Name: ix_tool_invocations_tool_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_tool_invocations_tool_name ON public.tool_invocations USING btree (tool_name);


--
-- Name: ix_violations_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_violations_category ON public.violations USING btree (category);


--
-- Name: ix_violations_category_severity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_violations_category_severity ON public.violations USING btree (category, severity);


--
-- Name: ix_violations_check_id_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_violations_check_id_category ON public.violations USING btree (check_id, category);


--
-- Name: ix_violations_severity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_violations_severity ON public.violations USING btree (severity);


--
-- Name: agent_executions agent_executions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agent_executions
    ADD CONSTRAINT agent_executions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: compliance_checks compliance_checks_submission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.compliance_checks
    ADD CONSTRAINT compliance_checks_submission_id_fkey FOREIGN KEY (submission_id) REFERENCES public.submissions(id) ON DELETE CASCADE;


--
-- Name: deep_analysis deep_analysis_check_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deep_analysis
    ADD CONSTRAINT deep_analysis_check_id_fkey FOREIGN KEY (check_id) REFERENCES public.compliance_checks(id) ON DELETE CASCADE;


--
-- Name: rules fk_rules_created_by_users; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rules
    ADD CONSTRAINT fk_rules_created_by_users FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: submissions submissions_submitted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_submitted_by_fkey FOREIGN KEY (submitted_by) REFERENCES public.users(id);


--
-- Name: tool_invocations tool_invocations_execution_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tool_invocations
    ADD CONSTRAINT tool_invocations_execution_id_fkey FOREIGN KEY (execution_id) REFERENCES public.agent_executions(id) ON DELETE CASCADE;


--
-- Name: violations violations_check_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.violations
    ADD CONSTRAINT violations_check_id_fkey FOREIGN KEY (check_id) REFERENCES public.compliance_checks(id) ON DELETE CASCADE;


--
-- Name: violations violations_rule_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.violations
    ADD CONSTRAINT violations_rule_id_fkey FOREIGN KEY (rule_id) REFERENCES public.rules(id);


--
-- PostgreSQL database dump complete
--

\unrestrict My6Mdk6vtXuyKifs6KZTLvENQHlBISC1ybfff7mrujSm7qYs7RT1w7RFh9JZnyE

