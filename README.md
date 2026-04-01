# Blood Cancer Cell Detection System

A cloud-based web application for AI-powered blood cancer cell detection using deep learning. Doctors and lab technicians upload blood cell microscope images, and the system classifies them as cancerous or non-cancerous using ResNet50 and EfficientNet-B0 models.

## Architecture

The system consists of 3 services orchestrated via Docker Compose:

| Service | Tech Stack | Port |
|---------|-----------|------|
| **Frontend** | React 18 + TypeScript + Tailwind CSS (served by Nginx) | 80 |
| **Backend** | Express.js + Prisma ORM + SQLite | 3001 |
| **ML Service** | FastAPI + PyTorch (ResNet50 & EfficientNet-B0) | 8000 |

```
Frontend (Nginx) ---> /api/* proxy ---> Backend (Express) ---> ML Service (FastAPI)
                                             |
                                         SQLite DB
```

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed
- ~2 GB disk space (for Docker images and model weights)
- Model weight files (see [Model Weights](#model-weights) section)

---

## Quick Start (Docker)

Follow these steps to run the entire project using Docker:

### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd <repo-folder>
```

### Step 2: Set Up Environment Variables

The `.env` file is **NOT** included in the repository (it is gitignored for security). You must create it manually.

```bash
# Copy the example environment file
cp .env.example .env
```

Then edit `.env` and set your values:

```env
# Port Configuration
FRONTEND_PORT=80        # Host port for frontend (Nginx)
BACKEND_PORT=3001       # Host port for backend API
ML_PORT=8000            # Host port for ML service

# Backend Security
JWT_SECRET=your-strong-random-secret-key-here   # REQUIRED: change this!
BCRYPT_ROUNDS=12                                 # Password hashing rounds

# CAPTCHA (optional - leave blank to disable)
RECAPTCHA_SITE_KEY=
RECAPTCHA_SECRET_KEY=
```

> **Important:** The `.env` file contains secrets (JWT_SECRET) and must **never** be committed to Git. Share it with teammates via a secure channel (encrypted message, password manager, etc.) - **not** through the Git repository.

### Step 3: Add Model Weights

The ML model weight files (`.pth`) are too large for Git and are **not included** in the repository. You must obtain them separately.

Place the following files in `ml-service/weights/`:

```
ml-service/
  weights/
    best_resnet50_bloodcells.pth        (~90 MB)
    best_efficientnetb0_bloodcells.pth  (~16 MB)
```

> **How to get the weights:** Ask your teammate to share the `ml-service/weights/` folder via Google Drive, OneDrive, or any file sharing service. Without these files, the ML service will start but predictions will fail.

### Step 4: Build and Start All Services

```bash
docker-compose up --build
```

This single command will:
1. Build the Frontend container (compiles React app, serves via Nginx)
2. Build the Backend container (installs Node.js dependencies, generates Prisma client)
3. Build the ML Service container (installs Python/PyTorch dependencies, loads models)
4. Run database migrations automatically on first start
5. Seed the database with demo data (hospitals, users, patients, sample diagnoses)
6. Start all 3 services and connect them on an internal Docker network

The first build takes a few minutes (downloading base images and dependencies). Subsequent starts are faster due to Docker layer caching.

### Step 5: Access the Application

Once all containers are running:

| Service | URL |
|---------|-----|
| **Web Application** | [http://localhost](http://localhost) (or `http://localhost:80`) |
| **Backend API** | [http://localhost:3001](http://localhost:3001) |
| **ML Service** | [http://localhost:8000](http://localhost:8000) |
| **Health Check** | [http://localhost:3001/health](http://localhost:3001/health) |
| **ML Health** | [http://localhost:8000/health](http://localhost:8000/health) |

### Step 6: Log In with Demo Accounts

The seed data creates the following demo users (password for all: `password123`):

| Role | Email | Name |
|------|-------|------|
| Admin | arjun.mehta@admin.com | Arjun Mehta |
| Doctor | priya.sharma@citygeneral.com | Dr. Priya Sharma |
| Doctor | rajesh.nair@apollo.com | Dr. Rajesh Nair |
| Lab Tech | vikram.patel@citygeneral.com | Vikram Patel |
| Lab Tech | anita.kulkarni@apollo.com | Anita Kulkarni |

---

## Common Docker Commands

```bash
# Start all services (detached mode - runs in background)
docker-compose up -d

# Start and rebuild (after code changes)
docker-compose up --build

# Stop all services
docker-compose down

# Stop and remove all data (volumes, database)
docker-compose down -v

# View logs for all services
docker-compose logs -f

# View logs for a specific service
docker-compose logs -f backend
docker-compose logs -f ml-service
docker-compose logs -f frontend

# Restart a single service
docker-compose restart backend

# Check service status
docker-compose ps
```

---

## Environment Variables Explained

All environment variables are managed through a **single `.env` file** in the project root. Docker Compose reads this file and injects the variables into the appropriate containers.

| Variable | Default | Description |
|----------|---------|-------------|
| `FRONTEND_PORT` | `80` | Host port for the frontend Nginx server |
| `BACKEND_PORT` | `3001` | Host port for the backend Express API |
| `ML_PORT` | `8000` | Host port for the FastAPI ML service |
| `JWT_SECRET` | `change-me-in-production` | Secret key for JWT token signing. **Must be changed!** |
| `BCRYPT_ROUNDS` | `12` | Number of bcrypt hashing rounds for passwords |
| `RECAPTCHA_SITE_KEY` | _(empty)_ | Google reCAPTCHA v2 site key (optional) |
| `RECAPTCHA_SECRET_KEY` | _(empty)_ | Google reCAPTCHA v2 secret key (optional) |

### How ENV Variables Work with Docker Compose

- The `docker-compose.yml` references variables like `${JWT_SECRET:-change-me-in-production}`
- Docker Compose automatically reads the `.env` file from the project root
- The `:-` syntax provides default values if a variable is not set
- Backend-specific variables (DATABASE_URL, ML_SERVICE_URL, etc.) are hardcoded in `docker-compose.yml` because they use Docker's internal networking (e.g., `http://ml-service:8000`)
- **You do NOT need separate `.env` files for each service when using Docker.** The root `.env` file is sufficient.

### Sharing ENV with Teammates

The `.env` file is gitignored and will **not** be transferred when someone clones the repo. To share it:

1. **Recommended:** Share via a secure channel (Slack DM, encrypted email, password manager like 1Password/Bitwarden)
2. **Alternative:** Each teammate creates their own `.env` from `.env.example` and sets their own `JWT_SECRET`
3. **Never** commit `.env` to Git - it contains secrets

---

## Local Development (Without Docker)

If you want to run services individually for development:

### Backend

```bash
cd Backend
npm install
cp .env.example .env          # Edit .env with your values
npx prisma migrate dev        # Create/update database
npx prisma db seed            # Seed demo data
npm run dev                   # Start with auto-reload
```

### Frontend

```bash
cd Frontend
npm install
cp .env.example .env          # Set VITE_API_URL=http://localhost:3001
npm run dev                   # Starts at http://localhost:5173
```

### ML Service

```bash
cd ml-service
python -m venv .venv
source .venv/bin/activate     # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
# Place weight files in weights/ directory
uvicorn app.main:app --reload --port 8000
```

---

## Project Structure

```
/
├── Frontend/                    # React SPA
│   ├── src/
│   │   ├── components/          # Page & UI components
│   │   ├── services/            # API service layer
│   │   ├── constants/           # API endpoints, config
│   │   └── types/               # TypeScript type definitions
│   ├── nginx.conf               # Nginx reverse proxy config
│   ├── Dockerfile               # Multi-stage build (Node + Nginx)
│   └── .env.example
│
├── Backend/                     # Express.js API
│   ├── src/
│   │   ├── modules/             # Feature modules (auth, upload, predict, etc.)
│   │   ├── config/              # Prisma client config
│   │   ├── uploadSecurity.js    # File validation & sanitization
│   │   └── captcha.js           # CAPTCHA generation
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema (9 models)
│   │   ├── migrations/          # Database migration files
│   │   └── seed.js              # Demo data seeder
│   ├── docker-entrypoint.sh     # Startup script (migrate + seed + start)
│   ├── Dockerfile
│   └── .env.example
│
├── ml-service/                  # FastAPI ML microservice
│   ├── app/
│   │   ├── main.py              # FastAPI endpoints (/predict, /health)
│   │   ├── models.py            # ResNet50 & EfficientNet-B0 builders
│   │   ├── inference.py         # Image preprocessing & prediction
│   │   ├── gradcam.py           # Grad-CAM heatmap generation
│   │   └── config.py            # Model config & class names
│   ├── weights/                 # Model weight files (gitignored)
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── docker-compose.yml           # 3-service orchestration
├── .env.example                 # Environment variable template
└── README.md                    # This file
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Backend health check |
| GET | `/api/captcha` | Generate CAPTCHA challenge |
| POST | `/api/auth/signup` | User registration |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/profile` | Get user profile |
| POST | `/api/upload/sample` | Upload blood cell image |
| POST | `/api/predict` | Run ML prediction on uploaded image |
| GET | `/api/diagnoses?page=&limit=` | List all diagnoses (paginated) |
| GET | `/api/reports?page=&limit=` | List patient reports (paginated) |
| GET | `/api/dashboard/stats` | Dashboard statistics |
| GET | `/api/dashboard/trends` | Monthly trend data |
| GET | `/api/metrics` | ML model performance metrics |
| GET | `/api/audit-logs?page=&limit=` | Audit log entries |

## User Roles

| Role | Description |
|------|-------------|
| **ADMIN** | Full system access, user management |
| **DOCTOR** | Upload samples, view diagnoses, manage patients |
| **LAB_TECH** | Upload samples, run analyses |
| **HOSPITAL** | Hospital-level administration |

## ML Models

The system supports two pre-trained models for blood cell classification:

- **BCCD (ResNet50):** Standard blood cell detection model with 8-class output
- **EfficientNet-B0:** Enhanced accuracy model with same 8-class classification

Both models classify blood cells into 8 types: basophil, eosinophil, erythroblast, ig (immature granulocytes), lymphocyte, monocyte, neutrophil, and platelet. Cells classified as erythroblast or ig indicate potential cancer markers.

Users can run a single model or compare both models side-by-side.

## Troubleshooting

### ML Service shows "No models loaded"
Ensure weight files are placed in `ml-service/weights/` with the exact names:
- `best_resnet50_bloodcells.pth`
- `best_efficientnetb0_bloodcells.pth`

### Database errors on first start
The backend automatically runs migrations on startup. If issues persist:
```bash
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend node prisma/seed.js
```

### Port conflicts
If ports 80, 3001, or 8000 are in use, change them in your `.env` file:
```env
FRONTEND_PORT=3000
BACKEND_PORT=3002
ML_PORT=8001
```

### Rebuild after code changes
```bash
docker-compose up --build
```

### Reset everything (fresh start)
```bash
docker-compose down -v
docker-compose up --build
```

## License

Proprietary - All rights reserved
