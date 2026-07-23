-- Insert Initial Sample Data into documents table safely
INSERT INTO documents (
    document_id,
    client_id,
    client_name,
    document_name,
    document_type,
    status,
    uploaded_on,
    expiry_date,
    file_name,
    file_type,
    created_at
)
VALUES
    ('DOC-1001', 'C0001', 'ABC Corporation', 'Certificate of Incorporation', 'Legal Document', 'Verified', '10 May 2026', '10 May 2031', 'certificate_inc.pdf', 'application/pdf', NOW()),
    ('DOC-1002', 'C0001', 'ABC Corporation', 'Memorandum & Articles', 'Legal Document', 'Verified', '10 May 2026', '10 May 2031', 'memorandum.pdf', 'application/pdf', NOW()),
    ('DOC-1003', 'C0001', 'ABC Corporation', 'PAN Card / Tax ID', 'Tax Document', 'Verified', '10 May 2026', 'N/A', 'pancard_abc.png', 'image/png', NOW()),
    ('DOC-1004', 'C0002', 'John Doe', 'Passport Copy', 'Identity Proof', 'Pending', '11 May 2026', '15 Aug 2029', 'passport_johndoe.pdf', 'application/pdf', NOW()),
    ('DOC-1005', 'C0003', 'XYZ Pvt Ltd', 'Audited Financial Statement', 'Financial Document', 'Active', '12 May 2026', '31 Mar 2027', 'financials_2025.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', NOW()),
    ('DOC-1006', 'C0004', 'Global Solutions', 'Proof of Address', 'Address Proof', 'Pending', '15 May 2026', '15 Nov 2026', 'utility_bill.pdf', 'application/pdf', NOW())
    ON CONFLICT (document_id)
DO NOTHING;

-- Insert Initial Sample Clients
INSERT INTO clients (client_id, client_name, client_type, risk_rating, status, onboarded_on, created_at)
VALUES
    ('C0001', 'ABC Corporation', 'Corporate', 'High', 'Active', '10 May 2026', NOW()),
    ('C0002', 'John Doe', 'Individual', 'Low', 'Active', '12 May 2026', NOW()),
    ('C0003', 'XYZ Pvt Ltd', 'Corporate', 'Medium', 'Active', '14 May 2026', NOW()),
    ('C0004', 'Global Solutions', 'Corporate', 'High', 'KYC Review', '15 May 2026', NOW()),
    ('C0005', 'Jane Smith', 'Individual', 'Low', 'Active', '16 May 2026', NOW()),
    ('C0006', 'Tech Innovations', 'Corporate', 'Medium', 'Onboarding', '17 May 2026', NOW()),
    ('C0007', 'Michael Brown', 'Individual', 'Low', 'Active', '18 May 2026', NOW()),
    ('C0008', 'Alpha Ventures', 'Corporate', 'High', 'KYC Review', '19 May 2026', NOW())
    ON CONFLICT (client_id) DO NOTHING;