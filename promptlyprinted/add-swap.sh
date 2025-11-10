#!/bin/bash
# Script to add swap space to help with Docker builds on low-memory servers

echo "Checking current swap status..."
free -h

if [ $(swapon --show | wc -l) -gt 0 ]; then
    echo "Swap is already configured:"
    swapon --show
    read -p "Do you want to add more swap? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 0
    fi
fi

echo ""
echo "This will create a 4GB swap file to help with Docker builds"
echo "This requires root access"
echo ""

# Create swap file
sudo fallocate -l 4G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=4096

# Set permissions
sudo chmod 600 /swapfile

# Make it a swap file
sudo mkswap /swapfile

# Enable it
sudo swapon /swapfile

# Make it permanent
if ! grep -q "/swapfile" /etc/fstab; then
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
fi

# Optimize swappiness for server
sudo sysctl vm.swappiness=10
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf

echo ""
echo "Swap added successfully!"
free -h
