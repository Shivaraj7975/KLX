# Production Deployment Guide

This document describes how to deploy the full-stack campus marketplace project in a production environment with the frontend on **Vercel**, the backend on **Render**, and the database on **MongoDB Atlas**.

---

## 1. Database Setup (MongoDB Atlas)

1. Sign up/log in at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new project and select **Create a Database** (Shared/Free tier is sufficient for testing).
3. Under **Security Quickstart**:
   - Create a database user (note down the username and password).
   - Add your local IP address to the IP Access List (for testing) and add `0.0.0.0/0` (allow access from anywhere) to allow Render servers to connect to the database.
4. Click **Choose a connection method** -> **Drivers** (Node.js).
5. Copy the connection string. It will look like this:
   `mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/?retryWrites=true&w=majority`
   Replace `<username>` and `<password>` with your database user credentials.

---

## 2. Backend Deployment (Render)

We will host the Express.js API on Render as a **Web Service**.

### Configuration Steps:
1. Log in to [Render](https://render.com/).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository.
4. Configure the service:
   - **Name**: `klx-backend` (or custom name)
   - **Region**: Select a region close to your target users (e.g., Singapore or US East)
   - **Branch**: `main`
   - **Root Directory**: `backend` *(Setting this will make Render isolate and build the backend folder directly)*
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: `Free` (or appropriate paid tier)
5. Click **Advanced** and add the following **Environment Variables**:

| Key | Example Value | Description |
| :--- | :--- | :--- |
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster...` | MongoDB Atlas Connection String (with credentials) |
| `JWT_SECRET` | `use-a-strong-random-key-here` | Secret key used to sign JWT authentication tokens |
| `ADMIN_EMAIL` | `admin@kletech.ac.in` | Email that will automatically receive Admin privileges |
| `FRONTEND_URL` | `https://klx-marketplace.vercel.app` | The production URL of your Vercel frontend (for CORS) |
| `NODE_ENV` | `production` | Set to `production` to optimize performance |
| `PORT` | `5000` | Port for Express (Render overrides this automatically, but good to set) |
| `BREVO_SMTP_HOST` | `smtp-relay.brevo.com` | (Optional) SMTP Host for sending verification emails |
| `BREVO_SMTP_PORT` | `587` | (Optional) SMTP Port (usually 587 or 465) |
| `BREVO_SMTP_USER` | `SMTP login user` | (Optional) SMTP User credential |
| `BREVO_SMTP_PASS` | `SMTP password` | (Optional) SMTP Password credential |
| `BREVO_FROM_EMAIL`| `no-reply@yourdomain.com` | (Optional) Sender address for outgoing emails |

6. Click **Create Web Service**. Render will install dependencies and start the server. Copy the public URL provided by Render (e.g. `https://klx-backend.onrender.com`).

---

## 3. Frontend Deployment (Vercel)

We will host the React/Vite SPA frontend on Vercel.

### Configuration Steps:
1. Log in to [Vercel](https://vercel.com/).
2. Click **Add New** -> **Project**.
3. Import your GitHub repository.
4. Configure the project:
   - **Framework Preset**: `Vite` (Vercel should auto-detect this)
   - **Root Directory**: `frontend` *(Required to build only the frontend code)*
   - **Build and Output Settings**: Default (Build Command: `npm run build`, Output Directory: `dist`)
5. Expand the **Environment Variables** section and add:

| Key | Value | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `https://klx-backend.onrender.com/api` | The URL of your backend API on Render (append `/api`) |

6. Click **Deploy**. Vercel will build the frontend and provide you with a deployment URL (e.g. `https://klx-marketplace.vercel.app`).
7. **Important**: Make sure to copy this Vercel URL and add it as the `FRONTEND_URL` environment variable back in your Render backend settings to allow seamless CORS communication!

---

## 4. How Client-side Routing is Handled (vercel.json)

Vite React applications use client-side routing (React Router). In production, refreshing the page on routes like `/login` or `/profile` would normally result in a Vercel `404 Not Found` error.
To solve this, we have created a [vercel.json](frontend/vercel.json) file inside the `frontend/` directory:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
This configuration instructs Vercel to rewrite all routes to `/index.html`, allowing React Router to handle page rendering seamlessly on reload.
