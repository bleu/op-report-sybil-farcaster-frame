-- Create your tables
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    reporter_fid bigint NOT NULL,
    sybil_fid bigint NOT NULL,
    cast_hash CHAR(42),
    message_hash CHAR(42),
    network Int,
    report_timestamp TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add some initial data if needed
-- INSERT INTO reports (reporter_fid, sybil_fid, cast_hash, message_hash, network, report_timestamp) 
-- VALUES 
--     (860200, 458045, '0x70b876b73b94f837ba3639d504741fffdbc03059', '0x0847c40c1910110ee739b29ad9c1da5408a64aa0', 1, to_timestamp(1730903918000::bigint/1000));