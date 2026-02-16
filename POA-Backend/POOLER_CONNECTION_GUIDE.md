# Supabase Pooler Connection Guide

## Current Setup

You're using the **Session Pooler** which is IPv4 compatible:
- **Host:** `aws-1-ap-southeast-1.pooler.supabase.com`
- **Port:** `5432`
- **Pooling:** Enabled (default)

## Connection String Format

The connection string should be:
```
Host=aws-1-ap-southeast-1.pooler.supabase.com;Port=5432;Database=postgres;Username=postgres.hupzvopjajggdnedsofk;Password=YOUR_PASSWORD;Ssl Mode=Require;Trust Server Certificate=true;Pooling=true
```

## DNS Resolution Issue

If your corporate DNS can't resolve the pooler hostname, you have these options:

### Option 1: Use IP Address (Current Workaround)
```
Host=13.213.241.248;Port=5432;Database=postgres;Username=postgres.hupzvopjajggdnedsofk;Password=YOUR_PASSWORD;Ssl Mode=Require;Trust Server Certificate=true
```

**Note:** IP addresses can change. If it stops working, resolve again:
```powershell
nslookup aws-1-ap-southeast-1.pooler.supabase.com 8.8.8.8
```

### Option 2: Change Windows DNS (Recommended)
Use Google DNS (8.8.8.8) or Cloudflare DNS (1.1.1.1) to bypass corporate DNS restrictions.

### Option 3: Use Transaction Pooler (Alternative)
If available, you can try the transaction pooler on port 6543:
```
Host=aws-1-ap-southeast-1.pooler.supabase.com;Port=6543;Database=postgres;Username=postgres.hupzvopjajggdnedsofk;Password=YOUR_PASSWORD;Ssl Mode=Require;Trust Server Certificate=true
```

## Pooler Types

Supabase offers two pooler types:

1. **Session Pooler (Port 5432)** - Current setup
   - One connection per client
   - Better for long-running connections
   - IPv4 compatible ✅

2. **Transaction Pooler (Port 6543)** - Alternative
   - Connection per transaction
   - Better for short-lived connections
   - Also IPv4 compatible ✅

## Verification

To verify your connection string is working:
1. Restart your backend
2. Try logging in
3. Check for connection errors in the console

## Current Status

✅ Using Session Pooler (port 5432)
✅ IPv4 compatible
❌ DNS resolution blocked by corporate DNS
✅ Using IP address as workaround

