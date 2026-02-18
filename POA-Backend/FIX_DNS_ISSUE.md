# Fix DNS Resolution Issue

## Problem
Your corporate DNS server (`ns.cyber.net.pk`) is blocking/refusing queries to Supabase hostnames.

## Solution Options

### Option 1: Change Windows DNS Settings (Recommended)

1. **Open Network Settings:**
   - Right-click on your network icon in the system tray
   - Select "Open Network & Internet settings"
   - Click "Change adapter options"
   - Right-click on your active network adapter (Wi-Fi or Ethernet)
   - Select "Properties"

2. **Change DNS:**
   - Select "Internet Protocol Version 4 (TCP/IPv4)"
   - Click "Properties"
   - Select "Use the following DNS server addresses:"
   - Enter:
     - **Preferred DNS server:** `8.8.8.8` (Google DNS)
     - **Alternate DNS server:** `1.1.1.1` (Cloudflare DNS)
   - Click "OK" on all dialogs

3. **Flush DNS Cache:**
   ```powershell
   ipconfig /flushdns
   ```

4. **Restart your backend application**

### Option 2: Use IP Address Directly (Temporary Workaround)

**⚠️ Warning:** IP addresses can change, so this is only a temporary solution.

Update your connection string in user secrets:

```powershell
cd D:\POA-App\POA-Backend\POA.WebApi
dotnet user-secrets set "ConnectionStrings:Database" "Host=13.213.241.248;Port=5432;Database=postgres;Username=postgres.hupzvopjajggdnedsofk;Password=Nabi@k248311;Ssl Mode=Require;Trust Server Certificate=true"
```

**Note:** If this IP stops working, use the other IP: `3.1.167.181`

### Option 3: Use VPN

If your company has a VPN, connect to it to bypass the DNS restrictions.

### Option 4: Contact IT Department

Ask your IT department to whitelist/allow DNS queries for:
- `*.supabase.com`
- `*.pooler.supabase.com`
- `aws-1-ap-southeast-1.pooler.supabase.com`

## Verification

After changing DNS, verify it works:

```powershell
nslookup aws-1-ap-southeast-1.pooler.supabase.com
```

You should see the IP addresses: `13.213.241.248` and `3.1.167.181`

