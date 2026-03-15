-- Resource offerings link table
CREATE TABLE IF NOT EXISTS resource_offerings (
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  offering_id UUID NOT NULL REFERENCES offerings(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT TRUE,
  priority INT DEFAULT 0,
  PRIMARY KEY (resource_id, offering_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_resource_offerings_offering_id ON resource_offerings(offering_id);
CREATE INDEX IF NOT EXISTS idx_resource_offerings_resource_id ON resource_offerings(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_offerings_offering_active_priority ON resource_offerings(offering_id, is_active, priority);
