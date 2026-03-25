-- Add first_call_completed column to distributors table
-- This tracks if distributor has called their voice agent for the first time
-- Used to show special welcome message on first call only

ALTER TABLE distributors
ADD COLUMN first_call_completed BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN distributors.first_call_completed IS
'Tracks if distributor has called their voice agent for the first time. Used to show special welcome message on first call only.';
