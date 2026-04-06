# Railway Deployment Guide

## Deploy All Services with Docker on Railway

Railway will automatically detect and deploy all 3 services from docker-compose.yml

### Services that will be deployed:
1. Frontend (React + Nginx) - Port 80
2. Backend (Express + SQLite) - Port 3001  
3. ML Service (FastAPI + PyTorch) - Port 8000

### Railway will:
- Read docker-compose.yml
- Build Docker images for each service
- Deploy all 3 services
- Provide public URLs for each
- Handle networking automatically