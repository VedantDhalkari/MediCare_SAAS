#!/bin/bash
set -e

echo "=========================================================="
echo " Updating MediCare SAAS on EC2 Instance "
echo "=========================================================="

# 1. Pull the latest commits from GitHub
echo "Pulling latest changes from git repository..."
git pull origin main

# 2. Rebuild and restart only updated containers smoothly
echo "Rebuilding and restarting updated containers..."
sudo docker compose build --no-cache
sudo docker compose up -d --remove-orphans

echo ""
echo "=========================================================="
echo " ✓ MediCare SAAS Updated & Running! "
echo "=========================================================="
PUBLIC_IP=$(curl -s http://checkip.amazonaws.com || curl -s ifconfig.me || echo "YOUR-EC2-PUBLIC-IP")
echo " Patient Portal: http://$PUBLIC_IP"
echo " Admin Portal:   http://$PUBLIC_IP:8080"
echo " Backend API:    http://$PUBLIC_IP/api/doctors"
echo "=========================================================="
sudo docker compose ps
