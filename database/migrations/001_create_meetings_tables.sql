-- Migration: Create meetings and meeting_participants tables
-- Date: 2025-10-07
-- Description: Add tables for PM meetings tracking in calendar

-- Create meetings table
CREATE TABLE IF NOT EXISTS meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    meeting_date DATE NOT NULL,
    meeting_time TIME,
    duration_minutes INTEGER DEFAULT 60,
    meeting_type TEXT NOT NULL CHECK (meeting_type IN ('pm_meeting', 'team_meeting', 'client_meeting', 'site_visit', 'other')),
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    location TEXT,
    notes TEXT,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create meeting_participants junction table
CREATE TABLE IF NOT EXISTS meeting_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    response_status TEXT DEFAULT 'pending' CHECK (response_status IN ('pending', 'accepted', 'declined', 'tentative')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(meeting_id, user_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_meetings_date ON meetings(meeting_date);
CREATE INDEX IF NOT EXISTS idx_meetings_project ON meetings(project_id);
CREATE INDEX IF NOT EXISTS idx_meetings_created_by ON meetings(created_by);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON meetings(status);
CREATE INDEX IF NOT EXISTS idx_meeting_participants_meeting ON meeting_participants(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_participants_user ON meeting_participants(user_id);

-- Add updated_at trigger for meetings table
CREATE OR REPLACE FUNCTION update_meetings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_meetings_updated_at
    BEFORE UPDATE ON meetings
    FOR EACH ROW
    EXECUTE FUNCTION update_meetings_updated_at();

-- Comments for documentation
COMMENT ON TABLE meetings IS 'Stores PM meetings and other meeting types for calendar tracking';
COMMENT ON TABLE meeting_participants IS 'Junction table linking meetings to participant users';
COMMENT ON COLUMN meetings.meeting_type IS 'Type of meeting: pm_meeting, team_meeting, client_meeting, site_visit, other';
COMMENT ON COLUMN meetings.status IS 'Meeting status: scheduled, completed, cancelled, rescheduled';
COMMENT ON COLUMN meeting_participants.response_status IS 'Participant response: pending, accepted, declined, tentative';
