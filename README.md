# Peer Learning System - Frontend

A collaborative learning platform built with React, Vite, and Tailwind CSS.

## 🚀 Deployment on Render

This project is configured for deployment on Render as a **Static Site**.

### Automated Setup (Recommended)

1. Click **New +** on Render Dashboard.
2. Select **Blueprint**.
3. Connect your repository.
4. Render will use the `render.yaml` file to configure:
   - Build Command: `npm run build`
   - Publish Directory: `dist`
   - SPA Routing: Redirects all non-API paths to `index.html`
   - API Proxy: Routes `/api/v1/*` to the backend on Render.

### Manual Setup

If you prefer manual configuration:

1. **New Static Site**.
2. **Build Command**: `npm run build`
3. **Publish Directory**: `dist`
4. **Environment Variables**:
   - `VITE_API_URL`: `/api`
5. **Redirects/Rewrites**:
   - Source: `/api/v1/*` | Destination: `https://peer-learning-backend-h7x5.onrender.com/api/v1/*` | Type: `Rewrite`
   - Source: `/*` | Destination: `/index.html` | Type: `Rewrite`

## 🛠️ Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **API Client**: Axios with interceptors for auth

## 🔑 Key Features

- **Authentication**: JWT-based auth with HttpOnly cookie support.
- **Role-based Dashboards**: Custom interfaces for Learners and Tutors.
- **Session Management**: Real-time status updates (Scheduled -> Ongoing -> Completed).
- **Accessibility**: High contrast mode, font size adjustments, and keyboard navigation.
