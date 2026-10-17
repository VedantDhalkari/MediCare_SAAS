#!/bin/bash
set -e

echo "=========================================================="
echo " Starting MediCare SAAS EC2 Host Setup & Deployment "
echo "=========================================================="

# 1. Setup 2GB Swap Memory (Prevents out-of-memory errors on t2.micro)
if [ ! -f /swapfile ]; then
    echo "Creating 2GB swap space for t2.micro stability..."
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "✓ Swap configured successfully."
else
    echo "Swapfile already exists. Skipping."
fi

# 2. Update and install Docker & Docker Compose if not present
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    sudo apt-get update -y
    sudo apt-get install -y ca-certificates curl gnupg lsb-release git
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -aG docker $USER
    echo "✓ Docker installed."
fi

# 3. Build & Run Containers via Docker Compose
echo "Starting multi-container architecture (PostgreSQL + Backend + Frontend + Admin + Nginx)..."
sudo docker compose down --remove-orphans || true
sudo docker compose build --no-cache
sudo docker compose up -d

echo ""
echo "=========================================================="
echo " ✓ MediCare SAAS Deployed Successfully! "
echo "=========================================================="
PUBLIC_IP=$(curl -s http://checkip.amazonaws.com || curl -s ifconfig.me || echo "YOUR-EC2-PUBLIC-IP")
echo " Patients & Doctor Portal: http://$PUBLIC_IP"
echo " Admin Management Portal: http://$PUBLIC_IP:8080"
echo " Backend API Endpoint:    http://$PUBLIC_IP/api/doctors"
echo "=========================================================="
echo "Check container status: sudo docker compose ps"
echo "View live logs:         sudo docker compose logs -f"
echo "=========================================================="
