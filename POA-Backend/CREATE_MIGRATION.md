# Create Migration for Test Cases Table

## Steps to Create and Apply Migration

1. **Navigate to the Infrastructure project:**
   ```powershell
   cd D:\POA-App\POA-Backend\POA.Infrastructure
   ```

2. **Create a new migration:**
   ```powershell
   dotnet ef migrations add AddTestCasesTable --startup-project ..\POA.WebApi\POA.WebApi.csproj
   ```

3. **Apply the migration to your database:**
   ```powershell
   dotnet ef database update --startup-project ..\POA.WebApi\POA.WebApi.csproj
   ```

## What This Does

- Creates a migration file that will generate the `test_cases` table
- Applies the migration to your Supabase database
- Keeps your database schema in sync with your code

## Note

Make sure your connection string is configured in:
- `appsettings.json` or
- User secrets (recommended)

