# Server Optimization Guide - 4GB RAM Best Practices

## Quick Setup for 4GB Server

### 1. Enable Swap (REQUIRED)
```bash
# Create 2GB swap file
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Verify
sudo swapon --show
free -h
```

### 2. Optimize Swap Usage
```bash
# Set swappiness (how aggressively to use swap)
sudo sysctl vm.swappiness=10
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
```

## Coolify Configuration

### Dockerfile Settings
- **Build Pack:** `Dockerfile`
- **Dockerfile Location:** `Dockerfile`
- **Build Context:** `promptlyprinted`

### Memory Limits (Add to Docker build options)
```
--memory=3g --memory-swap=5g
```

## Memory Allocation

```
Total: 4GB RAM
├─ System/Docker: 1GB
├─ Build (temp): 2GB heap + 0.5GB overhead
└─ Runtime: 1.5GB heap + 0.5GB overhead
```

## Monitoring

### Check Memory Usage
```bash
# Real-time monitoring
docker stats

# System memory
free -h

# Swap usage
swapon --show
```

### If Build Fails (OOM)
1. Check swap is enabled: `sudo swapon --show`
2. Increase swap: `sudo fallocate -l 4G /swapfile2`
3. Clear Docker cache: `docker builder prune -a`

## Performance Tips

1. **Enable Docker BuildKit** (faster builds)
2. **Use cache mounts** (already in Dockerfile)
3. **Sequential builds** (prevents memory spikes)
4. **Schedule deploys** during low-traffic hours

## Scaling Options

When 4GB isn't enough:
- Upgrade to 8GB RAM (removes swap dependency)
- Build on local machine, push image
- Use CI/CD with more resources
