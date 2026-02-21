# Blood Cancer Cell Detection System

A modern, professional healthcare web dashboard for a cloud-based blood cancer cell detection application.

## Features

- 📊 **Dashboard Overview** - Analytics with charts and statistics
- 📤 **Upload & Diagnosis** - Blood cell image and lab report upload
- 🔬 **Diagnosis Results** - Detailed analysis and prediction results  
- 📈 **Model Performance Metrics** - Accuracy, precision, recall, F1-score, and confusion matrix
- 📋 **Patient Reports** - Searchable table of all diagnosis reports
- 🔒 **Audit & Security Logs** - System activity monitoring
- 👤 **User Profile** - Account settings and preferences

## Tech Stack

- **React 18** - UI framework
- **React Router 7** - Client-side routing
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **Vite** - Build tool

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to:
```
http://localhost:5173
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
/
├── src/
│   ├── main.tsx          # Application entry point
│   ├── App.tsx           # Root component
│   └── routes.tsx        # Route configuration
├── components/
│   ├── DashboardLayout.tsx
│   ├── DashboardOverview.tsx
│   ├── UploadDiagnosis.tsx
│   ├── DiagnosisResults.tsx
│   ├── ModelMetrics.tsx
│   ├── PatientReports.tsx
│   ├── AuditLogs.tsx
│   ├── UserProfile.tsx
│   └── ui/               # Reusable UI components
├── styles/
│   └── globals.css       # Global styles and Tailwind config
├── index.html            # HTML entry point
├── vite.config.ts        # Vite configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Project dependencies

```

## User Roles

The system supports multiple user roles:
- **Doctor** - Primary care physicians
- **Admin** - System administrators
- **Lab Technician** - Laboratory staff
- **Hospital Staff** - Hospital personnel

## Design Principles

- Clean medical UI with white backgrounds and light blue accents
- Professional healthcare aesthetics
- Accessible and clear typography
- Responsive web layout
- Trust and clinical reliability

## License

Proprietary - All rights reserved
