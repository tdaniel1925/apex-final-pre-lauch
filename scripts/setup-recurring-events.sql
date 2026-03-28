-- =============================================
-- Delete all test events and create production events
-- Tuesday & Thursday at 6:30pm at reachtheapex.net/live
-- =============================================

-- Delete all existing test events
DELETE FROM company_events;

-- Get the next Tuesday at 6:30pm CST
-- This will create events for the next 8 weeks (16 events total)

-- Helper function to get next occurrence of a weekday
CREATE OR REPLACE FUNCTION get_next_weekday(target_day INT, target_time TIME)
RETURNS TIMESTAMPTZ AS $$
DECLARE
  current_date_local DATE;
  days_until_target INT;
  next_occurrence TIMESTAMPTZ;
BEGIN
  -- Get current date in Central Time
  current_date_local := (NOW() AT TIME ZONE 'America/Chicago')::DATE;

  -- Calculate days until target day (0=Sunday, 2=Tuesday, 4=Thursday)
  days_until_target := (target_day - EXTRACT(DOW FROM current_date_local)::INT + 7) % 7;

  -- If today is the target day but time has passed, add 7 days
  IF days_until_target = 0 AND (NOW() AT TIME ZONE 'America/Chicago')::TIME > target_time THEN
    days_until_target := 7;
  END IF;

  -- Calculate next occurrence
  next_occurrence := (current_date_local + days_until_target * INTERVAL '1 day' + target_time) AT TIME ZONE 'America/Chicago';

  RETURN next_occurrence;
END;
$$ LANGUAGE plpgsql;

-- Insert recurring Tuesday events (next 8 weeks)
INSERT INTO company_events (
  event_name,
  event_type,
  event_description,
  event_date_time,
  event_duration_minutes,
  event_timezone,
  event_end_time,
  location_type,
  virtual_meeting_link,
  virtual_meeting_platform,
  requires_registration,
  invitation_subject,
  invitation_template,
  reminder_template,
  confirmation_template,
  status,
  is_featured,
  is_public,
  display_order,
  created_by_name,
  tags
)
SELECT
  'Tuesday Night Live Training',
  'training',
  'Join us every Tuesday evening for live training, Q&A, and team building. Learn the latest strategies and connect with fellow distributors!',
  get_next_weekday(2, '18:30:00'::TIME) + (n * INTERVAL '1 week'),
  90,
  'America/Chicago',
  get_next_weekday(2, '18:30:00'::TIME) + (n * INTERVAL '1 week') + INTERVAL '90 minutes',
  'virtual',
  'https://reachtheapex.net/live',
  'custom',
  false,
  '🎯 Join Us Tuesday Night for Live Training!',
  '<h2 style="color: #2c5aa0;">You''re Invited to Tuesday Night Live!</h2>
  <p>Join us this Tuesday evening for our weekly live training session. This is your chance to:</p>
  <ul>
    <li>Learn the latest strategies and techniques</li>
    <li>Get your questions answered live</li>
    <li>Connect with other motivated distributors</li>
    <li>Celebrate wins and share success stories</li>
  </ul>
  <p><strong>When:</strong> Tuesday at 6:30 PM Central Time</p>
  <p><strong>Where:</strong> <a href="https://reachtheapex.net/live">reachtheapex.net/live</a></p>
  <p>See you there!</p>',
  '<p>Reminder: Tuesday Night Live Training starts in 24 hours!</p>
  <p>Don''t miss out - join us at <a href="https://reachtheapex.net/live">reachtheapex.net/live</a> at 6:30 PM Central Time.</p>',
  '<p>Thanks for registering for Tuesday Night Live Training!</p>
  <p>We''ll see you on Tuesday at 6:30 PM Central Time at <a href="https://reachtheapex.net/live">reachtheapex.net/live</a></p>
  <p>Mark your calendar and we''ll send you a reminder!</p>',
  'active',
  true,
  true,
  1,
  'System',
  ARRAY['recurring', 'training', 'live', 'tuesday']::TEXT[]
FROM generate_series(0, 7) AS n;

-- Insert recurring Thursday events (next 8 weeks)
INSERT INTO company_events (
  event_name,
  event_type,
  event_description,
  event_date_time,
  event_duration_minutes,
  event_timezone,
  event_end_time,
  location_type,
  virtual_meeting_link,
  virtual_meeting_platform,
  requires_registration,
  invitation_subject,
  invitation_template,
  reminder_template,
  confirmation_template,
  status,
  is_featured,
  is_public,
  display_order,
  created_by_name,
  tags
)
SELECT
  'Thursday Night Live Training',
  'training',
  'Join us every Thursday evening for live training, Q&A, and team building. Learn the latest strategies and connect with fellow distributors!',
  get_next_weekday(4, '18:30:00'::TIME) + (n * INTERVAL '1 week'),
  90,
  'America/Chicago',
  get_next_weekday(4, '18:30:00'::TIME) + (n * INTERVAL '1 week') + INTERVAL '90 minutes',
  'virtual',
  'https://reachtheapex.net/live',
  'custom',
  false,
  '🎯 Join Us Thursday Night for Live Training!',
  '<h2 style="color: #2c5aa0;">You''re Invited to Thursday Night Live!</h2>
  <p>Join us this Thursday evening for our weekly live training session. This is your chance to:</p>
  <ul>
    <li>Learn the latest strategies and techniques</li>
    <li>Get your questions answered live</li>
    <li>Connect with other motivated distributors</li>
    <li>Celebrate wins and share success stories</li>
  </ul>
  <p><strong>When:</strong> Thursday at 6:30 PM Central Time</p>
  <p><strong>Where:</strong> <a href="https://reachtheapex.net/live">reachtheapex.net/live</a></p>
  <p>See you there!</p>',
  '<p>Reminder: Thursday Night Live Training starts in 24 hours!</p>
  <p>Don''t miss out - join us at <a href="https://reachtheapex.net/live">reachtheapex.net/live</a> at 6:30 PM Central Time.</p>',
  '<p>Thanks for registering for Thursday Night Live Training!</p>
  <p>We''ll see you on Thursday at 6:30 PM Central Time at <a href="https://reachtheapex.net/live">reachtheapex.net/live</a></p>
  <p>Mark your calendar and we''ll send you a reminder!</p>',
  'active',
  true,
  true,
  2,
  'System',
  ARRAY['recurring', 'training', 'live', 'thursday']::TEXT[]
FROM generate_series(0, 7) AS n;

-- Clean up helper function
DROP FUNCTION get_next_weekday;

-- Show created events
SELECT
  event_name,
  event_date_time AT TIME ZONE 'America/Chicago' as event_time_cst,
  status,
  virtual_meeting_link
FROM company_events
ORDER BY event_date_time
LIMIT 20;
