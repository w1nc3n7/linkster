#!/bin/bash

# URL Catalog Deployment Script for Ubuntu 24.04
# This script installs all requirements and sets up the URL Catalog application

# Exit on error
set -e

echo "===== URL Catalog Deployment Script ====="
echo "This script will install and set up the URL Catalog application on Ubuntu 24.04"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "Please run this script as root or with sudo"
  exit 1
fi

# Check if url0.txt exists
if [ ! -f "url0.txt" ]; then
  echo "Error: url0.txt file not found in the current directory"
  echo "Please place your URL list file (url0.txt) in the same directory as this script"
  exit 1
fi

echo "Step 1: Updating system packages..."
apt update && apt upgrade -y

echo "Step 2: Installing Node.js and npm..."
apt install nodejs npm -y

# Check Node.js version
NODE_VERSION=$(node -v)
echo "Installed Node.js version: $NODE_VERSION"

echo "Step 3: Installing PM2 for process management..."
npm install -g pm2

echo "Step 4: Creating application directory..."
mkdir -p /opt/url-catalog
cp -r . /opt/url-catalog/
cd /opt/url-catalog

echo "Step 5: Installing application dependencies..."
npm install

echo "Step 6: Setting up the application as a service with PM2..."
pm2 start server.js --name url-catalog
pm2 save
pm2 startup

echo "Step 7: Setting up firewall rules..."
# Check if ufw is installed
if command -v ufw &> /dev/null; then
  ufw allow 3000/tcp
  echo "Firewall rule added for port 3000"
else
  echo "UFW not installed. If you're using a firewall, please ensure port 3000 is open"
fi

echo ""
echo "===== Deployment Complete! ====="
echo "Your URL Catalog is now running at: http://$(hostname -I | awk '{print $1}'):3000"
echo ""
echo "To manually start/stop the service:"
echo "  - Start: pm2 start url-catalog"
echo "  - Stop: pm2 stop url-catalog"
echo "  - Restart: pm2 restart url-catalog"
echo "  - Status: pm2 status"
echo ""
echo "If you need to change the port, edit server.js and modify the PORT variable"
echo "Then restart with: pm2 restart url-catalog"
echo ""
echo "Thank you for using URL Catalog!"