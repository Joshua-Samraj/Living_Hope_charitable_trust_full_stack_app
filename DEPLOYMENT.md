# Deployment Guide

## Overview

This document provides instructions for deploying the Living Hope Charitable Trust application to production environments. The application consists of two main parts:

1. **Backend API** - Node.js/Express server
2. **Frontend** - React application built with Vite

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB database (Atlas or self-hosted)
- Render.com account (or alternative hosting provider)

## Backend Deployment

### Environment Setup

1. Create a `.env` file in the `backend` directory based on the `.env.example` template
2. Configure the following environment variables:
   - `MONGODB_URI` - Your MongoDB connection string
   - `PORT` - The port for the server (usually provided by the hosting platform)
   - `JWT_SECRET` - Secret key for JWT authentication
   - `FRONTEND_PROD_URL` - URL of your deployed frontend
   - `FRONTEND_DEV_URL` - URL of your local development frontend

### Deployment to Render.com

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: `living-hope-charitable-trust-api`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && node server.js`
   - **Add Environment Variables** from your `.env` file

4. Click "Create Web Service"

## Frontend Deployment

### Environment Setup

1. Create `.env.production` in the `client` directory
2. Set `VITE_API_URL` to your deployed backend URL (e.g., `https://living-hope-charitable-trust-api.onrender.com/api`)

### Deployment to Vercel

1. Create a new project on Vercel
2. Connect your GitHub repository
3. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
   - **Add Environment Variables** from your `.env.production` file

4. Click "Deploy"

## Deployment Checklist

Before finalizing deployment, verify the following:

- [ ] Backend API is accessible and returning expected responses
- [ ] Frontend is correctly connecting to the backend API
- [ ] CORS is properly configured to allow communication between frontend and backend
- [ ] All environment variables are correctly set
- [ ] Database connection is working properly
- [ ] Static assets (images, etc.) are loading correctly

## Troubleshooting

### API Connection Issues

If the frontend cannot connect to the backend API:

1. Verify that the `VITE_API_URL` is correctly set in `.env.production`
2. Check that CORS is properly configured in `server.js`
3. Ensure the backend service is running
4. Check for any network restrictions or firewall issues

### Database Connection Issues

If the backend cannot connect to MongoDB:

1. Verify that the `MONGODB_URI` is correct
2. Ensure that the IP address of your backend service is whitelisted in MongoDB Atlas
3. Check MongoDB Atlas logs for any connection issues

## Continuous Deployment

Both Vercel and Render support automatic deployments when changes are pushed to your repository. To enable this:

1. Configure the deployment settings in Vercel/Render to watch your main branch
2. Push changes to the main branch to trigger automatic deployments

## Monitoring

After deployment, monitor your application using:

1. Render/Vercel dashboard for service status
2. MongoDB Atlas dashboard for database performance
3. Application logs for error tracking

## Rollback Procedure

If a deployment causes issues:

1. In Vercel/Render dashboard, find the previous successful deployment
2. Select "Rollback to this deployment"
3. Verify that the application is functioning correctly after rollback