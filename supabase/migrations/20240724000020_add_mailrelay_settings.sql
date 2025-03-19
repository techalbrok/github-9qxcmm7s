-- Add Mailrelay API key to email_settings table
ALTER TABLE email_settings ADD COLUMN IF NOT EXISTS mailrelay_api_key TEXT DEFAULT 'jEYpBnAqnFRaQWfeCskvWDqTKvZ8vLkMhiws24jR';
ALTER TABLE email_settings ADD COLUMN IF NOT EXISTS use_mailrelay BOOLEAN DEFAULT true;