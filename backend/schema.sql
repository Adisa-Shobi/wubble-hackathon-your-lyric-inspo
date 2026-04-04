-- Tracks per-device usage per endpoint per hour for rate limiting and quotas
CREATE TABLE IF NOT EXISTS device_usage (
  device_id TEXT NOT NULL,
  endpoint TEXT NOT NULL,   -- 'suggest' | 'analyze' | 'chat'
  window TEXT NOT NULL,     -- hour bucket: '2026-04-04T18'
  count INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (device_id, endpoint, window)
);
