-- Set soummajumder231@gmail.com as admin
UPDATE profiles SET role = 'admin' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'soummajumder231@gmail.com');

-- Verify the update
SELECT p.id, p.customer_id, p.name, p.role, u.email 
FROM profiles p 
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'soummajumder231@gmail.com';