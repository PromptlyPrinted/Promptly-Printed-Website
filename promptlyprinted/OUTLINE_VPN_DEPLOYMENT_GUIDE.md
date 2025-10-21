# Outline VPN Deployment Guide - Hetzner USA Server

Complete step-by-step guide to deploy your own Outline VPN server on a cheap Hetzner USA VPS.

---

## What is Outline VPN?

**Outline VPN** is an open-source VPN solution created by Jigsaw (a Google subsidiary) that makes it incredibly easy to set up and manage your own VPN server. Unlike commercial VPN services, you own and control your server completely.

**Why Choose Outline?**
- ✅ Open source and transparent
- ✅ Simple setup (15 minutes)
- ✅ No logging or tracking
- ✅ Share access with family/team via unique keys
- ✅ Works on all platforms (iOS, Android, Windows, Mac, Linux)
- ✅ Uses modern Shadowsocks protocol
- ✅ Cheap to run (~€4.49/month with Hetzner)

**Why Hetzner?**
- ✅ Excellent price/performance ratio
- ✅ USA locations available (Ashburn, VA & Hillsboro, OR)
- ✅ High-quality network infrastructure
- ✅ Simple management interface
- ✅ Hourly billing (pay only for what you use)

---

## Prerequisites Checklist

- [ ] Credit card or PayPal account for Hetzner payment
- [ ] Hetzner Cloud account (sign up at https://www.hetzner.com)
- [ ] Computer with internet access (Mac, Windows, or Linux)
- [ ] 15 minutes of your time

---

## Phase 1: Hetzner USA Server Setup

### Step 1.1: Create Hetzner Account

1. Go to [Hetzner Cloud Console](https://console.hetzner.cloud/)
2. Click **Sign Up** (top right)
3. Fill in your details:
   - Email address
   - Password
   - Company name (optional - use your name if personal)
4. Verify your email
5. Add payment method (credit card or PayPal)

### Step 1.2: Create New Project

1. In Hetzner Cloud Console, click **New Project**
2. Name it: **"Outline VPN USA"** (or any name you prefer)
3. Click **Create Project**
4. You'll see an empty project dashboard

### Step 1.3: Create Your VPS Server

1. Click **Add Server** (big blue button)
2. Configure your server:

**Location:**
- Select: **Ashburn, VA (us-east)** - Best for East Coast
- Alternative: **Hillsboro, OR (us-west)** - Best for West Coast
- Choose the one closest to where you'll use the VPN most

**Image:**
- Select: **Ubuntu** → **Ubuntu 22.04** or **24.04**
- (Ubuntu is most reliable for Outline VPN)

**Type:**
- **Shared vCPU** (default)
- Select: **CX22** (€4.49/month)
  - 2 vCPU
  - 4 GB RAM
  - 40 GB SSD
  - 20 TB traffic (EU) / 1 TB traffic (US locations)
- Alternative: **CX11** (€3.79/month) if on tight budget
  - 1 vCPU
  - 2 GB RAM
  - 20 GB SSD
  - Good for 1-3 users

**Note:** CX22 is recommended for better performance with multiple users.

**Networking:**
- Leave defaults (IPv4 and IPv6 enabled)

**SSH Keys:**
- **Option 1 (Recommended - More Secure):**
  - Click **Add SSH Key**
  - On Mac/Linux terminal: `ssh-keygen -t ed25519 -C "outline-vpn"`
  - Copy public key: `cat ~/.ssh/id_ed25519.pub`
  - Paste into Hetzner and give it a name

- **Option 2 (Simpler):**
  - Skip SSH key setup
  - You'll receive root password via email

**Volume:**
- Leave empty (not needed for VPN)

**Firewalls:**
- Skip for now (we'll configure UFW on the server)

**Backups:**
- Optional: Enable for €1/month (20% of server cost)
- Not critical for VPN (easy to rebuild)

**Placement Groups:**
- Leave empty

**Labels:**
- Optional: Add label "vpn" or "outline"

**Name:**
- **Server name**: outline-vpn-usa

5. Click **Create & Buy Now**

### Step 1.4: Get Server Details

Wait ~30 seconds for server creation. You'll see:

- ✅ Server status: **Running**
- **IP Address**: e.g., `123.45.67.89` (IPv4)
- **Root password**: Shown once (or sent to email if no SSH key)

**IMPORTANT**: Copy and save these credentials:
```
IP: 123.45.67.89
Root password: [your-generated-password]
```

### Step 1.5: Connect to Your Server via SSH

#### On Mac/Linux:
```bash
# Replace with your server IP
ssh root@123.45.67.89
```

#### On Windows:
**Option 1: Use PowerShell**
```powershell
ssh root@123.45.67.89
```

**Option 2: Use PuTTY**
1. Download [PuTTY](https://www.putty.org/)
2. Enter your server IP in "Host Name"
3. Click "Open"
4. Login as: `root`

**First Connection:**
- Type `yes` when asked about fingerprint
- Enter root password (paste from clipboard)
- If using SSH key, you'll log in automatically

You should now see a terminal prompt like:
```
root@outline-vpn-usa:~#
```

✅ You're in!

---

## Phase 2: Install Outline VPN Server

### Step 2.1: Update Your Server (Important!)

```bash
# Update package lists
apt update

# Upgrade all packages
apt upgrade -y

# This may take 2-3 minutes
```

**Why?** Fresh servers need security updates before installing anything.

### Step 2.2: Install Outline Server (One Command!)

Run this single command to install Docker and Outline Server:

```bash
sudo bash -c "$(wget -qO- https://raw.githubusercontent.com/Jigsaw-Code/outline-server/master/src/server_manager/install_scripts/install_server.sh)"
```

**What this does:**
- Installs Docker (container platform)
- Downloads and runs Outline Server
- Configures firewall rules automatically
- Generates management credentials

⏱️ Installation takes ~2-3 minutes

**Expected Output:**
You'll see lots of text scrolling. Wait for it to complete.

### Step 2.3: Save Your Management Credentials

When installation completes, you'll see output like this:

```json
{
  "apiUrl": "https://123.45.67.89:12345/aBcDeFgHiJkLmNoPqRsTuVwXyZ",
  "certSha256": "1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF"
}
```

**CRITICAL STEP**:
1. **Copy this ENTIRE JSON output** (including the curly braces `{}`)
2. **Save it in a secure location** (password manager, secure note)
3. You'll need this in the next phase

⚠️ **WARNING**: This is shown only once! If you lose it, you'll need to reinstall.

---

## Phase 3: Setup Outline Manager (On Your Computer)

### Step 3.1: Download Outline Manager

The Outline Manager is the desktop app that lets you control your VPN server.

**Download for your platform:**
- **Windows**: https://s3.amazonaws.com/outline-releases/manager/windows/stable/Outline-Manager.exe
- **Mac**: https://s3.amazonaws.com/outline-releases/manager/macos/stable/Outline-Manager.dmg
- **Linux**: https://s3.amazonaws.com/outline-releases/manager/linux/stable/Outline-Manager.AppImage

Or visit: https://getoutline.org/get-started/

### Step 3.2: Install and Open Outline Manager

1. **Install** the application for your OS
2. **Open Outline Manager**
3. You'll see: "Set up Outline anywhere"

### Step 3.3: Connect to Your Server

1. Click **"Set up Outline anywhere"**
2. You'll see two options:
   - Get Outline on a cloud provider
   - I have already set up my server
3. Click **"I have already set up my server"** (bottom option)
4. **Paste** the JSON credentials from Step 2.3
5. Click **"Done"** or **"Connect"**

✅ **Success!** You should now see:
- Your server name
- Server location (USA)
- "0 keys" or key management interface

🎉 Your Outline VPN server is connected!

---

## Phase 4: Create VPN Access Keys

### Step 4.1: Create Your First Access Key

In Outline Manager:

1. Click **"Add new key"** button (+ icon)
2. A new access key is automatically generated
3. You'll see:
   - **Key Name**: "My access key" (or similar)
   - **Data transferred**: 0 GB
   - **Share button**: 📤 icon

### Step 4.2: Rename Your Key (Recommended)

1. Click the **✏️ (pencil) icon** next to the key
2. Give it a descriptive name:
   - "My iPhone"
   - "Work Laptop"
   - "Dad's Phone"
   - etc.
3. This helps you track which device is using each key

### Step 4.3: Set Data Limit (Optional)

To prevent excessive usage:

1. Click on your key
2. Find **"Data limit"** option
3. Click and set a monthly limit (e.g., 50 GB)
4. Key automatically stops when limit is reached
5. Resets monthly

**Recommended limits:**
- Personal use: 50-100 GB/month
- Shared with family member: 30-50 GB/month
- Guest/friend: 10-20 GB/month

**Note:** Hetzner USA locations include **1 TB traffic/month**, so you have plenty to share!

### Step 4.4: Get Your Access Key

Click the **📤 Share** button next to your key. You'll see:

**Access Key Format:**
```
ss://Y2hhY2hhMjAtaWV0Zi1wb2x5MTMwNTp...@123.45.67.89:12345/?outline=1
```

**Three sharing methods:**
1. **Copy link** - For manual entry on desktop
2. **Show QR code** - For easy mobile setup (just scan!)
3. **Send via email** - Direct sending to someone

---

## Phase 5: Connect Devices to Your VPN

### Step 5.1: Download Outline Client Apps

Download the Outline Client for your devices:

**Mobile:**
- **iOS**: https://apps.apple.com/app/outline-app/id1356177741
- **Android**: https://play.google.com/store/apps/details?id=org.outline.android.client

**Desktop:**
- **Windows**: https://s3.amazonaws.com/outline-releases/client/windows/stable/Outline-Client.exe
- **Mac**: https://s3.amazonaws.com/outline-releases/client/macos/stable/Outline-Client.dmg
- **Linux**: https://s3.amazonaws.com/outline-releases/client/linux/stable/Outline-Client.AppImage

**Browser:**
- **Chrome Extension**: Search "Outline" in Chrome Web Store

### Step 5.2: Add Access Key to Client

**Method 1: QR Code (Easiest for mobile)** 📱
1. Open **Outline Client** app on your phone
2. Tap **"+"** or **"Add Server"**
3. Tap **"Scan QR code"**
4. Scan the QR code from Outline Manager
5. Server is automatically added!
6. Tap **"Connect"**

**Method 2: Copy/Paste** 💻
1. Open **Outline Client** app
2. Click/Tap **"+"** or **"Add Server"**
3. **Paste** your access key (the `ss://` link)
4. Click/Tap **"Add Server"**
5. Click/Tap **"Connect"**

**Method 3: One-Tap Link (Mobile)** 📲
1. Send the `ss://` link to your phone (email, message, etc.)
2. Tap the link on your phone
3. It opens Outline Client automatically
4. Tap **"Add Server"** → **"Connect"**

### Step 5.3: Test Your VPN Connection

Once connected, the Outline Client will show "Connected" with a green indicator.

**Verify it's working:**

1. **Check your IP address**: https://whatismyipaddress.com
   - Should show your **Hetzner server IP** ✅
   - Should show location as **Ashburn, VA** or **Hillsboro, OR** ✅

2. **Test DNS leak**: https://dnsleaktest.com
   - Should show **Hetzner/USA location** ✅
   - If it shows your real ISP, there's a DNS leak (rare with Outline)

3. **Speed test**: https://fast.com or https://speedtest.net
   - Speed depends on your internet and VPS
   - Expect 50-90% of your normal speed

🎉 **Congratulations! You're now using your own private VPN on Hetzner!**

---

## Phase 6: Manage Your VPN

### Managing Access Keys

**Create more keys** (for family/friends):
1. Click **"Add new key"** in Outline Manager
2. Each person gets their own unique key
3. Share different keys with different people
4. Track usage separately

**Rename keys**:
- Click **✏️ icon**
- Give descriptive names ("Mom's iPhone", "Work Laptop")
- Makes management much easier

**Set data limits**:
- Click key → **"Data limit"**
- Set monthly GB limit
- Key automatically stops when limit reached
- Resets at start of each month

**Delete keys**:
- Click **🗑️ (trash) icon**
- Confirm deletion
- That key stops working immediately
- User can't reconnect

### Monitor Usage

In Outline Manager, you can see:
- **Total data** transferred per key
- **Last connection** time
- **Number of active keys**
- **Server location and status**

Review weekly to:
- Check who's using the most data
- Remove inactive keys
- Adjust data limits
- Plan for upgrades if needed

### Change Server Port (If Blocked)

Some networks block common VPN ports. To change:

1. In Outline Manager, go to **Settings** (gear icon)
2. Find **"Change port"** option
3. Enter new port number:
   - **443** (HTTPS - rarely blocked)
   - **80** (HTTP - rarely blocked)
   - **8080** (common alternative)
4. Click **"Apply"**
5. Server automatically reconfigures
6. **Old access keys still work!** (they update automatically)

---

## Troubleshooting Guide

### Can't Connect to Server After Installation

**Issue**: Outline Manager won't connect to server after installation

**Solutions:**

1. **Check if Outline container is running**:
   ```bash
   # SSH into your Hetzner server
   ssh root@123.45.67.89

   # Check Docker containers
   docker ps

   # Should see outline-server container running
   ```

2. **Verify firewall isn't blocking**:
   ```bash
   # Check if UFW is active
   ufw status

   # If active and blocking, allow Outline ports
   ufw allow 443/tcp
   ufw allow 1024:65535/tcp
   ufw allow 1024:65535/udp
   ```

3. **Check Hetzner Firewall (if configured)**:
   - Go to Hetzner Cloud Console
   - Click on your server
   - Check **Firewalls** tab
   - If firewall applied, make sure it allows all ports

4. **Restart Docker and Outline**:
   ```bash
   systemctl restart docker
   docker restart $(docker ps -qf name=outline)
   ```

5. **Reinstall if necessary**:
   ```bash
   # Stop and remove old containers
   docker stop $(docker ps -q)
   docker rm $(docker ps -aq)

   # Reinstall Outline
   sudo bash -c "$(wget -qO- https://raw.githubusercontent.com/Jigsaw-Code/outline-server/master/src/server_manager/install_scripts/install_server.sh)"
   ```

### VPN Connects But No Internet

**Issue**: Connected to VPN but can't browse internet

**Solutions:**

1. **Enable IP forwarding**:
   ```bash
   # SSH into server
   ssh root@123.45.67.89

   # Enable forwarding
   echo "net.ipv4.ip_forward=1" >> /etc/sysctl.conf
   sysctl -p
   ```

2. **Test DNS resolution**:
   ```bash
   # Test if server can reach internet
   ping 8.8.8.8
   ping google.com

   # If ping fails, check network config
   ```

3. **Restart Outline container**:
   ```bash
   docker restart $(docker ps -qf name=outline)
   ```

4. **Check Hetzner network status**:
   - Go to Hetzner Cloud Console
   - Check if server shows "Running"
   - Check for any network issues/maintenance

### Slow VPN Speed

**Issue**: VPN is working but very slow

**Solutions:**

1. **Upgrade Hetzner server**:
   - In Hetzner Console → Select server
   - Click **"Resize"**
   - Upgrade to **CX32** (4 vCPU, 8GB RAM) - €14.99/month
   - Better CPU = faster encryption

2. **Check server location**:
   - If you're on East Coast, use Ashburn, VA
   - If you're on West Coast, use Hillsboro, OR
   - Wrong location = higher latency

3. **Check server load**:
   ```bash
   # SSH into server
   htop

   # Look at CPU usage
   # If consistently >80%, upgrade server
   ```

4. **Test different times of day**:
   - Network congestion varies
   - Try early morning vs evening

5. **Check your local internet**:
   - Test speed without VPN: https://fast.com
   - VPN speed will be 50-90% of this

### Access Key Not Working

**Issue**: Can't connect with access key on device

**Solutions:**

1. **Regenerate key**:
   - In Outline Manager, delete the old key
   - Create new key
   - Try new key on device

2. **Check server status**:
   - Open Outline Manager
   - Server should show **"Online"**
   - If offline, check Hetzner console

3. **Verify key format**:
   - Should start with `ss://`
   - No spaces or line breaks
   - Copy carefully from share dialog

4. **Try different network**:
   - Some networks block VPN
   - Try mobile data instead of WiFi
   - Try changing server port to 443

### Hit Traffic Limit

**Issue**: Warning about reaching 1TB traffic limit

**Solutions:**

1. **Check usage in Outline Manager**:
   - See which keys use most data
   - Set data limits on high-usage keys

2. **Hetzner traffic limits**:
   - USA locations: **1 TB/month included**
   - After 1TB, speed reduced to 1 Mbit/s (still usable but slow)
   - Next month resets

3. **Upgrade for more traffic**:
   - Create server in **EU location** (Nuremberg or Helsinki)
   - EU servers include **20 TB/month** traffic
   - Same price, way more bandwidth!
   - Slightly higher latency if you're in USA

4. **Add second server**:
   - Create separate VPS for heavy users
   - Split family between two servers
   - €4.49/month per server

---

## Advanced Configuration

### Add Domain Name (Optional)

Using a domain instead of IP can help avoid some blocks:

1. **Buy a domain** (cheap options):
   - Namecheap: ~$8-12/year
   - Cloudflare: ~$8-10/year
   - Google Domains: ~$12/year

2. **Add A record in DNS**:
   ```
   Type: A
   Name: vpn (or @)
   Value: 123.45.67.89 (your Hetzner IP)
   TTL: 300
   ```

3. **Wait for DNS propagation** (5-10 minutes):
   ```bash
   # Test DNS
   ping vpn.yourdomain.com
   # Should return your Hetzner IP
   ```

4. **Update Outline Manager**:
   - In Manager, edit server settings
   - Replace IP with `vpn.yourdomain.com`
   - Keys automatically update

### Enable Automatic Updates

Keep your server secure with auto-updates:

```bash
# Install unattended-upgrades
apt install unattended-upgrades -y

# Configure to auto-update
dpkg-reconfigure -plow unattended-upgrades

# Select: Yes

# Check it's running
systemctl status unattended-upgrades
```

This automatically installs security updates daily.

### Create Hetzner Snapshot (Backup)

Save your server configuration:

1. In **Hetzner Cloud Console**, select your server
2. Go to **"Snapshots"** tab
3. Click **"Take Snapshot"**
4. Name it: "outline-vpn-backup-2025-10-20"
5. Wait ~2-3 minutes

**Benefits:**
- Restore if server breaks
- Clone to create second server
- Cost: €0.01/GB/month (~€0.40/month for CX22)

**To restore from snapshot:**
1. Create new server
2. Under "Image", select **"Snapshots"**
3. Choose your snapshot
4. Server rebuilds with all your Outline config!

### Monitor Server Resources

Install monitoring tools:

```bash
# Install htop (CPU/RAM monitor)
apt install htop -y

# Run it
htop
# Press q to quit

# Install vnstat (bandwidth monitor)
apt install vnstat -y
vnstat -m  # Monthly stats
vnstat -d  # Daily stats
```

### Set Up Email/Uptime Monitoring (Optional)

Get notified if VPN goes down:

**Free monitoring services:**
- **UptimeRobot**: https://uptimerobot.com (Free tier)
- **Better Uptime**: https://betteruptime.com (Free tier)
- **Pingdom**: https://pingdom.com (Trial)

**Setup:**
1. Create account
2. Add your Hetzner IP to monitor
3. Set check interval: 5 minutes
4. Add your email for alerts
5. Get notified if server goes down!

---

## Security Best Practices

### 1. Create Non-Root User (Recommended)

Running as root is risky. Create a regular user:

```bash
# Create new user
adduser vpnadmin

# Set password when prompted

# Add to sudo group
usermod -aG sudo vpnadmin

# Test login in new terminal
ssh vpnadmin@123.45.67.89

# If works, disable root login
sudo nano /etc/ssh/sshd_config

# Change: PermitRootLogin yes → PermitRootLogin no
# Save: Ctrl+X, Y, Enter

# Restart SSH
sudo systemctl restart sshd
```

### 2. Enable UFW Firewall

```bash
# Install UFW
apt install ufw -y

# Allow SSH (CRITICAL - do first!)
ufw allow 22/tcp

# Allow Outline ports
ufw allow 443/tcp
ufw allow 1024:65535/tcp
ufw allow 1024:65535/udp

# Enable firewall
ufw enable
# Type: y (yes)

# Check status
ufw status verbose
```

### 3. Change SSH Port (Optional)

Reduce automated attacks:

```bash
# Edit SSH config
nano /etc/ssh/sshd_config

# Find: #Port 22
# Change to: Port 2222

# Save: Ctrl+X, Y, Enter

# Update firewall
ufw allow 2222/tcp
ufw delete allow 22/tcp

# Restart SSH
systemctl restart sshd

# Connect with new port:
ssh -p 2222 root@123.45.67.89
```

### 4. Enable Fail2Ban (Blocks Brute Force)

```bash
# Install fail2ban
apt install fail2ban -y

# Start and enable
systemctl start fail2ban
systemctl enable fail2ban

# Check status
fail2ban-client status sshd
```

This automatically bans IPs after failed login attempts.

### 5. Keep Access Keys Private

**Best practices:**
- Never share access keys publicly (social media, forums, etc.)
- Use separate keys for each person
- Delete keys for people who no longer need access
- Set data limits for shared keys
- Review usage monthly
- Rotate keys if compromised

### 6. Regular Security Updates

```bash
# Update monthly (or enable auto-updates)
apt update && apt upgrade -y

# Update Docker containers
docker pull $(docker inspect --format='{{.Config.Image}}' $(docker ps -q))
docker restart $(docker ps -q)
```

---

## Cost Breakdown

### Monthly Costs with Hetzner

**VPS Server (CX22)**: €4.49/month (~$4.85 USD)
- 2 vCPU
- 4 GB RAM
- 40 GB SSD
- 1 TB traffic (USA locations)

**VPS Server (CX11)**: €3.79/month (~$4.10 USD)
- 1 vCPU
- 2 GB RAM
- 20 GB SSD
- 1 TB traffic (USA locations)

**Optional Add-ons:**
- Snapshots/Backups: ~€0.40/month (€0.01/GB)
- Domain name: ~€10/year (€0.83/month)

**Total Monthly Cost**: €4.49-5.32/month (~$4.85-5.75 USD)

### Cost Comparison

**Commercial VPN Services (per user):**
- NordVPN: $12/month
- ExpressVPN: $13/month
- Private Internet Access: $10/month
- Surfshark: $13/month

**Your Hetzner Outline VPN**: €4.49/month ($4.85)
- **Unlimited users** (share with family!)
- **Complete privacy** (you control the server)
- No logging
- No speed throttling

**Savings for Family of 4:**
- Commercial VPN: $48/month (4 × $12)
- Hetzner Outline: $4.85/month
- **Annual Savings: $518** 💰

---

## Sharing with Family/Team

### Create Keys for Each Person

1. In Outline Manager, click **"Add new key"** for each person
2. Rename keys with names:
   - "Dad - iPhone"
   - "Mom - iPad"
   - "Sister - Laptop"
   - "Friend John"
3. Set appropriate data limits:
   - Heavy users: 100-200 GB/month
   - Normal users: 30-50 GB/month
   - Light users: 10-20 GB/month

### Example Family Setup

**Family of 4 on CX22 server:**
- Dad's iPhone: Key 1 (100GB limit)
- Mom's iPad: Key 2 (50GB limit)
- Kid 1 Laptop: Key 3 (50GB limit)
- Kid 2 Phone: Key 4 (30GB limit)

**Total**: 230GB/month well within 1TB limit
**Cost per person**: €1.12/month ($1.21 each)

**Benefits over commercial VPN:**
- Save $500+/year
- Full control and privacy
- No shared IPs with strangers
- Faster speeds (dedicated resources)

---

## Hetzner-Specific Tips

### Hourly Billing

Hetzner bills **hourly** (not just monthly):
- Create server when needed
- Delete when not needed
- Only pay for hours used

**Example:**
- Use VPN while traveling (2 weeks)
- Cost: ~€2.25 for CX22 (half month)
- Delete server when home
- Save money!

### Resize Server Easily

Need more power?

1. Go to **Hetzner Cloud Console**
2. Select your server
3. Click **"Resize"**
4. Choose new plan:
   - **CX32**: €14.99/month (4 vCPU, 8GB RAM)
   - **CX42**: €28.99/month (8 vCPU, 16GB RAM)
5. Click **"Resize"**
6. Server reboots (~1 minute downtime)
7. Outline continues working automatically!

### Multiple Servers Strategy

For power users:

**Option 1: USA + EU Servers**
- Server 1: Ashburn (USA traffic)
- Server 2: Helsinki (EU traffic + 20TB bandwidth)
- Switch based on needs

**Option 2: Redundancy**
- 2 USA servers (€8.98/month total)
- If one goes down, use the other
- High availability

### Hetzner Support

- **Docs**: https://docs.hetzner.com
- **Support tickets**: Via Hetzner Console
- **Community**: https://community.hetzner.com
- Response time: Usually within 24 hours

---

## When to Upgrade Your Server

### Signs You Need More Power

**Performance indicators:**
- VPN speed consistently slow (<10 Mbps)
- Server CPU usage >80% consistently
- More than 10 simultaneous users
- Frequent disconnections
- Approaching 1TB traffic limit

**Check with:**
```bash
# SSH into server
htop  # Check CPU and RAM
vnstat -d  # Check bandwidth usage
```

### Hetzner Upgrade Path

**Current: CX22** (€4.49/month)
↓
**Upgrade: CX32** (€14.99/month)
- 4 vCPU, 8GB RAM
- Good for 10-20 users

↓
**Upgrade: CX42** (€28.99/month)
- 8 vCPU, 16GB RAM
- Good for 20-50 users

**Or:** Switch to **EU location** for 20TB traffic

---

## Maintenance Schedule

### Weekly
- [ ] Check VPN is working (test connection)
- [ ] Review key usage in Outline Manager
- [ ] Verify server shows "Running" in Hetzner

### Monthly
- [ ] Update server: `apt update && apt upgrade -y`
- [ ] Review data usage per key
- [ ] Delete unused keys
- [ ] Check Hetzner bill
- [ ] Verify backup/snapshot exists

### Quarterly
- [ ] Test VPN speed (https://fast.com)
- [ ] Review security settings
- [ ] Update access keys if widely shared
- [ ] Consider if server size is appropriate

### Yearly
- [ ] Renew domain (if using one)
- [ ] Evaluate if Hetzner still best option
- [ ] Consider upgrading server specs
- [ ] Review sharing arrangements

---

## Quick Reference Commands

### SSH into Hetzner Server
```bash
ssh root@your-server-ip
```

### Check Outline Status
```bash
docker ps
docker logs $(docker ps -qf name=outline)
```

### Restart Outline
```bash
docker restart $(docker ps -qf name=outline)
```

### Monitor Resources
```bash
htop              # CPU/RAM
df -h             # Disk space
vnstat -d         # Bandwidth (daily)
vnstat -m         # Bandwidth (monthly)
```

### Update Server
```bash
apt update && apt upgrade -y
```

### Backup Outline Config
```bash
docker cp $(docker ps -qf name=outline):/opt/outline ~/outline-backup
```

### Check Firewall
```bash
ufw status verbose
```

---

## Support Resources

- **Outline Docs**: https://getoutline.org/support
- **Outline GitHub**: https://github.com/Jigsaw-Code/outline-server
- **Hetzner Docs**: https://docs.hetzner.com
- **Hetzner Community**: https://community.hetzner.com/tutorials/install-outline-vpn-server
- **Reddit**: r/outlinevpn

---

## Final Checklist

- [ ] Hetzner account created
- [ ] Payment method added
- [ ] Project created in Hetzner
- [ ] Server created (USA location)
- [ ] SSH access working
- [ ] Server updated (`apt update/upgrade`)
- [ ] Outline Server installed
- [ ] Management credentials saved securely
- [ ] Outline Manager installed on computer
- [ ] Server connected to Manager
- [ ] First access key created and named
- [ ] Outline Client installed on device(s)
- [ ] VPN connection tested successfully
- [ ] IP check shows Hetzner server location
- [ ] DNS leak test passed
- [ ] Speed test acceptable
- [ ] UFW firewall configured (optional)
- [ ] Additional keys created for family (optional)
- [ ] Data limits set (optional)
- [ ] Snapshot/backup created (optional)
- [ ] Monitoring set up (optional)

**🎉 Congratulations! You now have your own private VPN running on Hetzner in the USA! 🔐🇺🇸**

---

## FAQ

### Why Hetzner over other providers?
- Best price/performance ratio
- High-quality network
- USA and EU locations
- Hourly billing flexibility
- Easy to use interface
- Reliable uptime

### Is €4.49/month really enough?
Yes! CX22 handles:
- 5-10 users easily
- HD video streaming
- Normal browsing/work
- 1TB traffic/month

Upgrade if you need more.

### What's the difference between US East and US West?
- **US East (Ashburn, VA)**: Better for East Coast, Europe
- **US West (Hillsboro, OR)**: Better for West Coast, Asia

Choose the one closest to you.

### Can I switch from USA to EU server?
Yes! EU servers have **20TB traffic** instead of 1TB:
1. Create new server in Helsinki or Nuremberg
2. Install Outline
3. Migrate keys
4. Delete USA server

Slightly higher latency from USA, but way more bandwidth.

### Will this work in China/Iran/etc?
Outline uses Shadowsocks protocol designed for censorship circumvention. It works better than most VPNs in restrictive countries, but success varies. Changing port to 443 helps.

### How many devices can I connect?
Unlimited! Each device needs its own key. CX22 handles 10+ simultaneous connections easily.

### Can I use this for torrenting?
Check Hetzner ToS - they generally allow it, but you're responsible for content. Consider using **seedbox** instead for heavy torrenting.

### What if I forget my access key?
No problem! Open Outline Manager, click share button on any key, copy again. Can't lose access as long as you have Manager connected.

### Can I move my server?
You can't change location of existing server, but you can:
1. Create new server in new location
2. Install Outline
3. Create new keys
4. Delete old server

### How secure is this really?
Very secure:
- Open source code (auditable)
- Modern encryption (Shadowsocks)
- You control the server (no third party)
- No logging
- Direct connection (not shared with strangers)

Much more trustworthy than commercial VPNs.

---

**Questions? Check the Troubleshooting section or visit Hetzner Community tutorials!**
