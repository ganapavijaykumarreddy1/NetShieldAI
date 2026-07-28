-- Seeding data for NetShield AI Role-Based Access Control

INSERT INTO roles (role_name, description) VALUES
('Administrator', 'Full system access, user management, system configurations, and alert policy administration.')
ON CONFLICT (role_name) DO UPDATE SET description = EXCLUDED.description;

INSERT INTO roles (role_name, description) VALUES
('Security Analyst', 'Analyze network monitoring feeds, triage anomalies, view security dashboards, and log incident notes.')
ON CONFLICT (role_name) DO UPDATE SET description = EXCLUDED.description;

INSERT INTO roles (role_name, description) VALUES
('SOC Manager', 'Oversee security operations, sign-off on incident escalations, generate threat intelligence reports, and review audit logs.')
ON CONFLICT (role_name) DO UPDATE SET description = EXCLUDED.description;
