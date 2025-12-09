-- SQL script to add the Summary column to the Documents table
-- Run this script directly on your SQL Server database

-- Check if the column exists before adding it
IF NOT EXISTS (
    SELECT * 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Documents' 
    AND COLUMN_NAME = 'Summary'
)
BEGIN
    ALTER TABLE [Documents]
    ADD [Summary] NVARCHAR(MAX) NULL;
    
    PRINT 'Summary column added successfully to Documents table.';
END
ELSE
BEGIN
    PRINT 'Summary column already exists in Documents table.';
END

