# Fix Database 500 Error

## Problem
The API is returning 500 errors because the `Summary` column is missing from the `Documents` table in your database.

## Quick Fix - Run SQL Script

1. **Open SQL Server Management Studio (SSMS)** or your preferred SQL client
2. **Connect to your database** (usually `NjalaPastQuestionsDB`)
3. **Open the SQL script**: `add_summary_column.sql`
4. **Execute the script** - it will safely add the column if it doesn't exist

The script is located at: `Njala-pastquestionsAPI-main/add_summary_column.sql`

## Alternative: Run Migration

If you prefer to use Entity Framework migrations:

1. **Stop your running application** (Ctrl+C in the terminal where it's running)
2. **Open a terminal** in the `Njala-pastquestionsAPI-main` directory
3. **Run**: `dotnet ef database update`
4. **Restart your application**

## Verify the Fix

After running the SQL script or migration:
- The `/api/document` endpoint should work without 500 errors
- Document uploads should work correctly
- The Summary column will be available for AI-generated summaries

