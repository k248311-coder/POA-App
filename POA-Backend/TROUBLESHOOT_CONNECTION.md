# Troubleshooting Database Connection

## Current Connection String Options

### Option 1: Session Pooler (Port 5432) - IP Address
```
Host=13.213.241.248;Port=5432;Database=postgres;Username=postgres.hupzvopjajggdnedsofk;Password=Nabi@k248311;Ssl Mode=Require;Trust Server Certificate=true;Pooling=true
```

### Option 2: Transaction Pooler (Port 6543) - IP Address 1
```
Host=13.213.241.248;Port=6543;Database=postgres;Username=postgres.hupzvopjajggdnedsofk;Password=Nabi@k248311;Ssl Mode=Require;Trust Server Certificate=true;Pooling=true
```

### Option 3: Transaction Pooler (Port 6543) - IP Address 2
```
Host=3.1.167.181;Port=6543;Database=postgres;Username=postgres.hupzvopjajggdnedsofk;Password=Nabi@k248311;Ssl Mode=Require;Trust Server Certificate=true;Pooling=true
```

## What Error Are You Getting?

Please share:
1. **Exact error message** from the backend console
2. **Error from Swagger** (if any)
3. **When does it fail?** (On startup? During login? Other?)

## Common Issues

### Issue: "No such host is known"
**Solution:** Already using IP address - this should be resolved

### Issue: "Connection refused" or "Connection timeout"
**Possible causes:**
- Firewall blocking the port
- Wrong port number
- IP address changed

**Try:**
- Test port connectivity: `Test-NetConnection -ComputerName 13.213.241.248 -Port 5432`
- Try the other IP: `3.1.167.181`
- Try different port: `6543` vs `5432`

### Issue: "Authentication failed" or "Password incorrect"
**Solution:** Verify password is correct in Supabase dashboard

### Issue: "SSL/TLS error"
**Solution:** Connection string already has `Ssl Mode=Require;Trust Server Certificate=true`

## Quick Test Commands

```powershell
# Test port 5432
Test-NetConnection -ComputerName 13.213.241.248 -Port 5432

# Test port 6543
Test-NetConnection -ComputerName 13.213.241.248 -Port 6543

# Test other IP
Test-NetConnection -ComputerName 3.1.167.181 -Port 6543

# Check current connection string
cd D:\POA-App\POA-Backend\POA.WebApi
dotnet user-secrets list | Select-String -Pattern "Database"
```

## Next Steps

1. **Share the exact error message** you're seeing
2. **Check backend console** for detailed error
3. **Verify Supabase dashboard** - check if database is accessible
4. **Try different IP/port combinations** from the options above

