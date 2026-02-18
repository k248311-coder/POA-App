# Check Startup Errors

## The 500 Error on Swagger

A 500 error on `https://localhost:5001/swagger/v1/swagger.json` usually means:
1. **Application failed to start** - Check backend console for errors
2. **Database connection failed** - Connection string issue
3. **Service registration failed** - Missing dependency

## How to Check the Actual Error

### Step 1: Check Backend Console
Look at the terminal/console where you're running `dotnet run`. You should see:
- Red error messages
- Stack traces
- Connection errors

### Step 2: Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for error messages

### Step 3: Check Network Tab
1. Open browser DevTools (F12)
2. Go to Network tab
3. Click on the failed request (`swagger.json`)
4. Check the Response tab for error details

## Common Errors and Fixes

### Error: "No such host is known"
**Fix:** Already using IP address - should be resolved

### Error: "Connection refused" or "Connection timeout"
**Possible causes:**
- Firewall blocking port 5432 or 6543
- Wrong IP address
- Supabase database is down

**Try:**
```powershell
# Test connectivity
Test-NetConnection -ComputerName 13.213.241.248 -Port 5432
Test-NetConnection -ComputerName 13.213.241.248 -Port 6543
```

### Error: "Authentication failed"
**Fix:** Verify password in Supabase dashboard

### Error: "SSL/TLS error"
**Fix:** Connection string already has SSL settings

## Quick Test

Try accessing the backend directly:
```
https://localhost:5001/api/projects
```

If this also gives 500, the issue is definitely at startup.

## Next Steps

1. **Share the exact error** from backend console
2. **Check if backend starts** - Look for "Now listening on..." message
3. **Try different connection string** if needed

