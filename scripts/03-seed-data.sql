-- Insert admin user (this will be created via Supabase Auth first)
-- The admin user should sign up normally, then we update their role

-- Insert sample landlords and tenants
INSERT INTO users (id, email, name, phone, role, verified, location, bio) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'landlord1@bularent.fj', 'Mere Ratunabuabua', '+679 999 1234', 'landlord', true, 'Suva', 'Experienced property manager with 10+ years in Fiji real estate.'),
    ('550e8400-e29b-41d4-a716-446655440002', 'landlord2@bularent.fj', 'Jone Vuki', '+679 999 5678', 'landlord', true, 'Nadi', 'Local property owner specializing in tourist accommodations.'),
    ('550e8400-e29b-41d4-a716-446655440003', 'tenant1@bularent.fj', 'Sarah Johnson', '+679 999 9012', 'tenant', false, 'Suva', 'Looking for a comfortable place near the city center.'),
    ('550e8400-e29b-41d4-a716-446655440004', 'tenant2@bularent.fj', 'Mike Chen', '+679 999 3456', 'tenant', false, 'Lautoka', 'Young professional seeking modern accommodation.');

-- Insert sample properties
INSERT INTO properties (id, landlord_id, title, description, location, price, bedrooms, bathrooms, property_type, amenities, images, status, available_from, lease_duration) VALUES
    (
        '660e8400-e29b-41d4-a716-446655440001',
        '550e8400-e29b-41d4-a716-446655440001',
        'Modern 2BR Apartment in Suva CBD',
        'Beautiful modern apartment in the heart of Suva with stunning harbor views. Fully furnished with air conditioning, modern kitchen, and secure parking. Walking distance to shops, restaurants, and business district.',
        'Suva CBD',
        1200.00,
        2,
        2,
        'Apartment',
        ARRAY['Air Conditioning', 'Furnished', 'Parking', 'Security', 'Harbor View', 'WiFi'],
        ARRAY['/placeholder.svg?height=400&width=600', '/placeholder.svg?height=400&width=600', '/placeholder.svg?height=400&width=600'],
        'approved',
        '2024-02-01',
        '12 months minimum'
    ),
    (
        '660e8400-e29b-41d4-a716-446655440002',
        '550e8400-e29b-41d4-a716-446655440002',
        'Beachfront Villa in Nadi',
        'Stunning 3-bedroom villa just steps from the beach. Perfect for families or groups. Features include private pool, tropical garden, and outdoor dining area. Close to Nadi Airport and tourist attractions.',
        'Nadi',
        2500.00,
        3,
        3,
        'Villa',
        ARRAY['Private Pool', 'Beach Access', 'Garden', 'BBQ Area', 'Airport Shuttle', 'Cleaning Service'],
        ARRAY['/placeholder.svg?height=400&width=600', '/placeholder.svg?height=400&width=600', '/placeholder.svg?height=400&width=600'],
        'approved',
        '2024-01-15',
        'Weekly or monthly'
    ),
    (
        '660e8400-e29b-41d4-a716-446655440003',
        '550e8400-e29b-41d4-a716-446655440001',
        'Cozy Studio in Tamavua',
        'Perfect starter home for young professionals. This cozy studio features modern amenities, great natural light, and easy access to public transport. Quiet neighborhood with local shops nearby.',
        'Tamavua',
        650.00,
        1,
        1,
        'Studio',
        ARRAY['Furnished', 'Public Transport', 'Quiet Area', 'Natural Light'],
        ARRAY['/placeholder.svg?height=400&width=600', '/placeholder.svg?height=400&width=600'],
        'pending',
        '2024-02-15',
        '6 months minimum'
    );

-- Insert sample ratings
INSERT INTO ratings (property_id, landlord_id, tenant_id, rating, comment) VALUES
    ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 5, 'Excellent property and very responsive landlord. Highly recommended!'),
    ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', 4, 'Beautiful location and well-maintained property. Great for vacation stays.');

-- Insert sample notifications
INSERT INTO notifications (receiver_id, title, message, type) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'New Property Inquiry', 'You have received a new inquiry for your Modern 2BR Apartment in Suva CBD', 'new_inquiry'),
    ('550e8400-e29b-41d4-a716-446655440002', 'Property Approved', 'Your Beachfront Villa in Nadi has been approved and is now live on BulaRent!', 'property_approval');
