CREATE TABLE jobs (
  id SERIAL PRIMARY KEY,
  job_id VARCHAR(255) UNIQUE NOT NULL,
  data JSONB,
  status VARCHAR(50) NOT NULL,
  error TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  started_at TIMESTAMP,
  done_by TIMESTAMP,
  attempts INT DEFAULT 0,
  max_attempts INT DEFAULT 3
);

CREATE INDEX idx_jobs_job_id ON jobs(job_id);