
-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user', 'viewer');

-- Create user_roles table for role-based access control
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create api_keys table for external integrations
CREATE TABLE public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  service TEXT NOT NULL, -- 'sap', 'openai', etc.
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create backup_jobs table for backup and restore functionality
CREATE TABLE public.backup_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  backup_type TEXT NOT NULL CHECK (backup_type IN ('full', 'templates', 'executions')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  file_path TEXT,
  file_size BIGINT,
  progress INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enhance templates table with more automation types
ALTER TABLE public.templates ADD COLUMN automation_type TEXT DEFAULT 'standard' CHECK (automation_type IN ('standard', 'workflow', 'api', 'scheduled'));
ALTER TABLE public.templates ADD COLUMN sap_system TEXT;
ALTER TABLE public.templates ADD COLUMN validation_rules JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.templates ADD COLUMN screenshot_config JSONB DEFAULT '{}'::jsonb;

-- Enhance task_runs table with better monitoring
ALTER TABLE public.task_runs ADD COLUMN sap_system TEXT;
ALTER TABLE public.task_runs ADD COLUMN validation_results JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.task_runs ADD COLUMN screenshots JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.task_runs ADD COLUMN execution_metadata JSONB DEFAULT '{}'::jsonb;

-- Create workflow_steps table for drag-and-drop workflows
CREATE TABLE public.workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.templates(id) ON DELETE CASCADE NOT NULL,
  step_order INTEGER NOT NULL,
  step_type TEXT NOT NULL CHECK (step_type IN ('action', 'validation', 'screenshot', 'condition', 'loop')),
  step_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sap_connections table for SAP system integration
CREATE TABLE public.sap_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  system_id TEXT NOT NULL,
  host TEXT NOT NULL,
  client TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  connection_config JSONB DEFAULT '{}'::jsonb,
  last_tested_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enhanced execution_logs with screenshot and validation data
ALTER TABLE public.execution_logs ADD COLUMN log_type TEXT DEFAULT 'info' CHECK (log_type IN ('info', 'warning', 'error', 'debug', 'screenshot', 'validation'));
ALTER TABLE public.execution_logs ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;

-- Enable Row Level Security on all new tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backup_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sap_connections ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create RLS policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create RLS policies for api_keys
CREATE POLICY "Users can manage their own API keys" ON public.api_keys
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for backup_jobs
CREATE POLICY "Users can view their own backup jobs" ON public.backup_jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own backup jobs" ON public.backup_jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own backup jobs" ON public.backup_jobs
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for workflow_steps
CREATE POLICY "Users can view workflow steps for their templates" ON public.workflow_steps
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.templates 
      WHERE templates.id = workflow_steps.template_id 
      AND templates.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage workflow steps for their templates" ON public.workflow_steps
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.templates 
      WHERE templates.id = workflow_steps.template_id 
      AND templates.user_id = auth.uid()
    )
  );

-- Create RLS policies for sap_connections
CREATE POLICY "Users can manage their own SAP connections" ON public.sap_connections
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX idx_backup_jobs_user_id ON public.backup_jobs(user_id);
CREATE INDEX idx_workflow_steps_template_id ON public.workflow_steps(template_id);
CREATE INDEX idx_workflow_steps_order ON public.workflow_steps(template_id, step_order);
CREATE INDEX idx_sap_connections_user_id ON public.sap_connections(user_id);
CREATE INDEX idx_execution_logs_type ON public.execution_logs(log_type);

-- Enable realtime for new tables only (task_runs already has realtime enabled)
ALTER TABLE public.execution_logs REPLICA IDENTITY FULL;
ALTER TABLE public.backup_jobs REPLICA IDENTITY FULL;

-- Add only the new tables to realtime publication (execution_logs and backup_jobs)
ALTER PUBLICATION supabase_realtime ADD TABLE public.execution_logs; 
ALTER PUBLICATION supabase_realtime ADD TABLE public.backup_jobs;
