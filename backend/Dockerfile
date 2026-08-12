# Backend Dockerfile for NetShield AI (FastAPI + Scapy + ML Inference)
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Set working directory
WORKDIR /app

# Install system dependencies for Scapy network packet capture & C extensions
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpcap-dev \
    gcc \
    net-tools \
    tcpdump \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code and pre-trained ML models
COPY . .

# Expose FastAPI backend port
EXPOSE 8000

# Start FastAPI application using Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
