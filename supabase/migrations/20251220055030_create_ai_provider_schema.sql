/*
  # AI Provider Management Schema

  1. New Tables
    - `ai_providers` - Configuration for each AI provider
    - `ai_api_keys` - Encrypted API keys per provider
    - `ai_usage_logs` - Log of every AI API call
    - `ai_provider_metrics` - Aggregated metrics per provider
    - `ai_provider_quotas` - Quota tracking per API key
    - `ai_cache` - Cache of AI responses
    
  2. Changes
    - Enables providers to be configured per task
    - Tracks costs and usage per provider
    - Stores all API call metadata
    
  3. Security
    - Enable RLS on all tables
    - API keys encrypted at rest
    - Only authenticated users can access their data
*/

CREATE TABLE IF NOT EXISTS ai_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  enabled boolean DEFAULT true,
  provider_type text NOT NULL,
  default_model text,
  base_url text,
  documentation_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES ai_providers(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  encrypted_key text NOT NULL,
  key_name text,
  is_active boolean DEFAULT true,
  quota_limit numeric,
  quota_used numeric DEFAULT 0,
  quota_reset_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(provider_id, user_id, key_name)
);

CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL REFERENCES ai_providers(id) ON DELETE CASCADE,
  api_key_id uuid REFERENCES ai_api_keys(id) ON DELETE SET NULL,
  task_type text NOT NULL,
  model_used text,
  campaign_id uuid,
  input_tokens integer,
  output_tokens integer,
  total_tokens integer,
  cost_usd numeric,
  response_time_ms integer,
  status text DEFAULT 'success',
  error_message text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_provider_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES ai_providers(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_type text NOT NULL,
  total_requests integer DEFAULT 0,
  successful_requests integer DEFAULT 0,
  failed_requests integer DEFAULT 0,
  total_tokens_used integer DEFAULT 0,
  total_cost_usd numeric DEFAULT 0,
  avg_response_time_ms integer,
  quality_score numeric,
  metric_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(provider_id, user_id, task_type, metric_date)
);

CREATE TABLE IF NOT EXISTS ai_task_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_type text NOT NULL,
  provider_priority jsonb NOT NULL DEFAULT '[]',
  preferred_model text,
  temperature numeric,
  max_tokens integer,
  cost_priority text DEFAULT 'balanced',
  quality_priority text DEFAULT 'balanced',
  is_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, task_type)
);

CREATE TABLE IF NOT EXISTS ai_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL REFERENCES ai_providers(id) ON DELETE CASCADE,
  task_type text NOT NULL,
  input_hash text NOT NULL,
  response_data jsonb NOT NULL,
  metadata jsonb DEFAULT '{}',
  expires_at timestamptz,
  hit_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, provider_id, task_type, input_hash)
);

ALTER TABLE ai_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_provider_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_task_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view provider info"
  ON ai_providers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own API keys"
  ON ai_api_keys FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own API keys"
  ON ai_api_keys FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own API keys"
  ON ai_api_keys FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own API keys"
  ON ai_api_keys FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own usage logs"
  ON ai_usage_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert usage logs"
  ON ai_usage_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own metrics"
  ON ai_provider_metrics FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own task config"
  ON ai_task_config FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own task config"
  ON ai_task_config FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own task config"
  ON ai_task_config FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own cache"
  ON ai_cache FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert cache"
  ON ai_cache FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update cache hit count"
  ON ai_cache FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_ai_usage_logs_user_id_created ON ai_usage_logs(user_id, created_at);
CREATE INDEX idx_ai_usage_logs_provider_created ON ai_usage_logs(provider_id, created_at);
CREATE INDEX idx_ai_usage_logs_task_type ON ai_usage_logs(task_type);
CREATE INDEX idx_ai_provider_metrics_user_task ON ai_provider_metrics(user_id, task_type);
CREATE INDEX idx_ai_cache_input_hash ON ai_cache(input_hash);
