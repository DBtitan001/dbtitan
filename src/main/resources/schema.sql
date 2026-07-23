DROP TABLE IF EXISTS documents;

CREATE TABLE documents (
                           id BIGSERIAL PRIMARY KEY,
                           document_id VARCHAR(50) NOT NULL UNIQUE,
                           client_id VARCHAR(50) NOT NULL,
                           client_name VARCHAR(255),
                           document_name VARCHAR(255) NOT NULL,
                           document_type VARCHAR(100),
                           status VARCHAR(50),
                           uploaded_on VARCHAR(50),
                           expiry_date VARCHAR(50),
                           file_name VARCHAR(255),
                           file_type VARCHAR(100),
                           file_data BYTEA,
                           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);