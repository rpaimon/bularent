-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update all users" ON users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Properties policies
CREATE POLICY "Anyone can view approved properties" ON properties
    FOR SELECT USING (status = 'approved' AND NOT archived);

CREATE POLICY "Landlords can view their own properties" ON properties
    FOR SELECT USING (landlord_id = auth.uid());

CREATE POLICY "Landlords can insert their own properties" ON properties
    FOR INSERT WITH CHECK (landlord_id = auth.uid());

CREATE POLICY "Landlords can update their own properties" ON properties
    FOR UPDATE USING (landlord_id = auth.uid());

CREATE POLICY "Landlords can delete their own properties" ON properties
    FOR DELETE USING (landlord_id = auth.uid());

CREATE POLICY "Admins can view all properties" ON properties
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Ratings policies
CREATE POLICY "Anyone can view ratings" ON ratings
    FOR SELECT USING (true);

CREATE POLICY "Tenants can insert ratings" ON ratings
    FOR INSERT WITH CHECK (tenant_id = auth.uid());

CREATE POLICY "Tenants can update their own ratings" ON ratings
    FOR UPDATE USING (tenant_id = auth.uid());

-- Fraud reports policies
CREATE POLICY "Users can view their own fraud reports" ON fraud_reports
    FOR SELECT USING (reporter_id = auth.uid());

CREATE POLICY "Users can insert fraud reports" ON fraud_reports
    FOR INSERT WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "Admins can view all fraud reports" ON fraud_reports
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Support tickets policies
CREATE POLICY "Users can view their own tickets" ON support_tickets
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert tickets" ON support_tickets
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all tickets" ON support_tickets
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (receiver_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (receiver_id = auth.uid());

CREATE POLICY "System can insert notifications" ON notifications
    FOR INSERT WITH CHECK (true);

-- Inquiries policies
CREATE POLICY "Tenants can view their own inquiries" ON inquiries
    FOR SELECT USING (tenant_id = auth.uid());

CREATE POLICY "Landlords can view inquiries for their properties" ON inquiries
    FOR SELECT USING (landlord_id = auth.uid());

CREATE POLICY "Tenants can insert inquiries" ON inquiries
    FOR INSERT WITH CHECK (tenant_id = auth.uid());

CREATE POLICY "Landlords can update inquiry status" ON inquiries
    FOR UPDATE USING (landlord_id = auth.uid());
