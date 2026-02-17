-- Booking System Initial Schema

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "moddatetime";

-- ============================================================================
-- TABLES
-- ============================================================================

-- Organizations (Multi-tenant root entity)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User-Organization Memberships with roles
CREATE TABLE user_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'manager', 'staff')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, organization_id)
);

-- Locations/branches
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  timezone TEXT DEFAULT 'Europe/Berlin',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Offerings/Services
CREATE TABLE offerings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INT NOT NULL DEFAULT 60,
  capacity INT DEFAULT 1,
  price_cents INT,
  color TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resources (staff, tables, rooms, equipment)
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('staff', 'table', 'room', 'equipment')),
  capacity INT DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Schedules (working hours/availability)
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  resource_id UUID REFERENCES resources(id) ON DELETE CASCADE NOT NULL,
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE NOT NULL,
  day_of_week INT CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blocks (holidays, breaks, maintenance)
CREATE TABLE blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  resource_id UUID REFERENCES resources(id) ON DELETE SET NULL,
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  reason TEXT,
  type TEXT CHECK (type IN ('holiday', 'break', 'maintenance', 'other')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings/Reservations
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE NOT NULL,
  offering_id UUID REFERENCES offerings(id) ON DELETE SET NULL,
  resource_id UUID REFERENCES resources(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit logs for compliance
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  changes JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notification logs (email/SMS tracking)
CREATE TABLE notification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('confirmation', 'reminder', 'cancellation', 'update')),
  channel TEXT NOT NULL CHECK (channel IN ('email', 'sms')),
  recipient TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  provider_id TEXT,
  error TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_user_organizations_user_id ON user_organizations(user_id);
CREATE INDEX idx_user_organizations_org_id ON user_organizations(organization_id);
CREATE INDEX idx_locations_org_id ON locations(organization_id);
CREATE INDEX idx_offerings_org_id ON offerings(organization_id);
CREATE INDEX idx_offerings_location_id ON offerings(location_id);
CREATE INDEX idx_resources_org_id ON resources(organization_id);
CREATE INDEX idx_resources_location_id ON resources(location_id);
CREATE INDEX idx_schedules_resource_id ON schedules(resource_id);
CREATE INDEX idx_schedules_location_id ON schedules(location_id);
CREATE INDEX idx_blocks_resource_id ON blocks(resource_id);
CREATE INDEX idx_blocks_location_id ON blocks(location_id);
CREATE INDEX idx_blocks_time_range ON blocks(start_time, end_time);
CREATE INDEX idx_bookings_org_id ON bookings(organization_id);
CREATE INDEX idx_bookings_location_id ON bookings(location_id);
CREATE INDEX idx_bookings_offering_id ON bookings(offering_id);
CREATE INDEX idx_bookings_resource_id ON bookings(resource_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_customer_email ON bookings(customer_email);
CREATE INDEX idx_bookings_time_range ON bookings(start_time, end_time);
CREATE INDEX idx_audit_logs_org_id ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_notification_log_booking_id ON notification_log(booking_id);
CREATE INDEX idx_notification_log_created_at ON notification_log(created_at);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER organizations_updated_at BEFORE UPDATE ON organizations
FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER locations_updated_at BEFORE UPDATE ON locations
FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER offerings_updated_at BEFORE UPDATE ON offerings
FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER bookings_updated_at BEFORE UPDATE ON bookings
FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ============================================================================
-- AUDIT LOGGING TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (organization_id, action, entity_type, entity_id, changes)
    VALUES (NEW.organization_id, 'CREATE', TG_TABLE_NAME, NEW.id, row_to_json(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (organization_id, action, entity_type, entity_id, changes)
    VALUES (NEW.organization_id, 'UPDATE', TG_TABLE_NAME, NEW.id, 
            jsonb_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW)));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (organization_id, action, entity_type, entity_id, changes)
    VALUES (OLD.organization_id, 'DELETE', TG_TABLE_NAME, OLD.id, row_to_json(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_bookings AFTER INSERT OR UPDATE OR DELETE ON bookings
FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_locations AFTER INSERT OR UPDATE OR DELETE ON locations
FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_offerings AFTER INSERT OR UPDATE OR DELETE ON offerings
FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_resources AFTER INSERT OR UPDATE OR DELETE ON resources
FOR EACH ROW EXECUTE FUNCTION create_audit_log();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE offerings ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;

-- Organizations: Users can see orgs they belong to
CREATE POLICY select_own_org ON organizations FOR SELECT
USING (id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()));

CREATE POLICY update_own_org ON organizations FOR UPDATE
USING (id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

-- User Organizations: Users can see their own memberships
CREATE POLICY select_own_membership ON user_organizations FOR SELECT
USING (user_id = auth.uid() OR organization_id IN 
  (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

-- Locations: Users can see locations of their orgs
CREATE POLICY select_locations ON locations FOR SELECT
USING (organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()));

CREATE POLICY insert_locations ON locations FOR INSERT
WITH CHECK (organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')));

CREATE POLICY update_locations ON locations FOR UPDATE
USING (organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')));

-- Offerings: Users can see offerings of their orgs
CREATE POLICY select_offerings ON offerings FOR SELECT
USING (organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()));

CREATE POLICY insert_offerings ON offerings FOR INSERT
WITH CHECK (organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')));

CREATE POLICY update_offerings ON offerings FOR UPDATE
USING (organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')));

-- Resources: Users can see resources of their orgs
CREATE POLICY select_resources ON resources FOR SELECT
USING (organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()));

CREATE POLICY insert_resources ON resources FOR INSERT
WITH CHECK (organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')));

CREATE POLICY update_resources ON resources FOR UPDATE
USING (organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')));

-- Schedules: Users can see schedules of their orgs
CREATE POLICY select_schedules ON schedules FOR SELECT
USING (organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()));

CREATE POLICY insert_schedules ON schedules FOR INSERT
WITH CHECK (organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')));

CREATE POLICY update_schedules ON schedules FOR UPDATE
USING (organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')));

-- Blocks: Users can see blocks of their orgs
CREATE POLICY select_blocks ON blocks FOR SELECT
USING (organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()));

CREATE POLICY insert_blocks ON blocks FOR INSERT
WITH CHECK (organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')));

CREATE POLICY update_blocks ON blocks FOR UPDATE
USING (organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')));

-- Bookings: Users can see bookings of their orgs OR their own email
CREATE POLICY select_bookings ON bookings FOR SELECT
USING (
  organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())
  OR customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Public can create bookings (will be rate-limited)
CREATE POLICY insert_bookings ON bookings FOR INSERT WITH CHECK (true);

-- Only org members can update bookings
CREATE POLICY update_bookings ON bookings FOR UPDATE
USING (organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()));

-- Only org members can delete bookings
CREATE POLICY delete_bookings ON bookings FOR DELETE
USING (organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()));

-- Audit logs: Only admins/owners can read
CREATE POLICY select_audit_logs ON audit_logs FOR SELECT
USING (organization_id IN 
  (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

-- Notification logs: Org members can see their org's notifications
CREATE POLICY select_notification_logs ON notification_log FOR SELECT
USING (organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()));

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get available time slots for a location/offering
CREATE OR REPLACE FUNCTION get_available_slots(
  p_location_id UUID,
  p_offering_id UUID,
  p_date DATE,
  p_duration_minutes INT
)
RETURNS TABLE (start_time TIMESTAMPTZ, end_time TIMESTAMPTZ) AS $$
DECLARE
  v_tz TEXT;
  v_day_of_week INT;
BEGIN
  -- Get timezone for location
  SELECT timezone INTO v_tz FROM locations WHERE id = p_location_id;
  
  -- Get day of week (0=Sunday, 6=Saturday)
  v_day_of_week := EXTRACT(DOW FROM p_date);
  
  -- Return available slots (simplified - can be expanded)
  -- This is a basic implementation; real logic would need to:
  -- 1. Get schedules for the day
  -- 2. Get existing bookings
  -- 3. Get blocks (holidays, breaks)
  -- 4. Calculate free slots
  
  RETURN QUERY
  SELECT 
    (p_date::TIMESTAMPTZ AT TIME ZONE v_tz) AT TIME ZONE 'UTC' as start_time,
    ((p_date::TIMESTAMPTZ AT TIME ZONE v_tz) + INTERVAL '1 hour') AT TIME ZONE 'UTC' as end_time
  WHERE EXISTS (
    SELECT 1 FROM schedules 
    WHERE location_id = p_location_id 
    AND day_of_week = v_day_of_week
    AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql;

-- Count bookings for a resource in a time range
CREATE OR REPLACE FUNCTION count_bookings_in_range(
  p_resource_id UUID,
  p_start_time TIMESTAMPTZ,
  p_end_time TIMESTAMPTZ
)
RETURNS INT AS $$
BEGIN
  RETURN COALESCE((
    SELECT COUNT(*)::INT FROM bookings
    WHERE resource_id = p_resource_id
    AND status NOT IN ('cancelled')
    AND start_time < p_end_time
    AND end_time > p_start_time
  ), 0);
END;
$$ LANGUAGE plpgsql;
