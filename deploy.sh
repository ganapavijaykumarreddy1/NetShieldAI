#!/bin/bash
# NetShield AI Production Deployment Script (Ubuntu/Debian)
# Run this script on your Cloud Server to automatically install Docker and start the app.

echo "🚀 Starting NetShield AI Deployment..."

# 1. Update the system
echo "📦 Updating system packages..."
sudo apt-get update -y
sudo apt-get upgrade -y

# 2. Install Docker if not installed
if ! command -v docker &> /dev/null
then
    echo "🐳 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo "✅ Docker installed successfully."
else
    echo "✅ Docker is already installed."
fi

# 3. Install Docker Compose if not installed
if ! command -v docker-compose &> /dev/null
then
    echo "🐙 Installing Docker Compose..."
    sudo apt-get install docker-compose-plugin -y
    sudo apt-get install docker-compose -y
    echo "✅ Docker Compose installed successfully."
else
    echo "✅ Docker Compose is already installed."
fi

# 4. Build and start the containers
echo "🏗️ Building and starting NetShield AI containers..."
sudo docker-compose down
sudo docker-compose up -d --build

# 5. Show Status
echo "=================================================="
echo "✅ DEPLOYMENT COMPLETE!"
echo "=================================================="
echo "Your NetShield AI application is now running in the cloud."
echo "You can access it by typing this server's Public IP address in your browser."
echo ""
sudo docker-compose ps
