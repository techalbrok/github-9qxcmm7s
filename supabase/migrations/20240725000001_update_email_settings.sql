-- Remove mailrelay-specific fields from email_settings table
ALTER TABLE email_settings
DROP COLUMN IF EXISTS mailrelay_api_key,
DROP COLUMN IF EXISTS use_mailrelay;
