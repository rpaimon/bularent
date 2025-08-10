-- Favorites policies
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own favorites" ON favorites
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own favorites" ON favorites
    FOR ALL USING (user_id = auth.uid());

-- Messages policies
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own messages" ON messages
    FOR SELECT USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can send messages" ON messages
    FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update their received messages" ON messages
    FOR UPDATE USING (receiver_id = auth.uid());

-- Conversations policies
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their conversations" ON conversations
    FOR SELECT USING (tenant_id = auth.uid() OR landlord_id = auth.uid());

CREATE POLICY "Users can create conversations" ON conversations
    FOR INSERT WITH CHECK (tenant_id = auth.uid() OR landlord_id = auth.uid());

-- Payments policies
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payments" ON payments
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own payments" ON payments
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all payments" ON payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Email notifications policies
ALTER TABLE email_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own email notifications" ON email_notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert email notifications" ON email_notifications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all email notifications" ON email_notifications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
