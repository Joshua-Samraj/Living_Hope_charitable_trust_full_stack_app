# Living Hope Trust Website

## Project Overview
This is a website for Living Hope Charitable Trust, built with React, TypeScript, and MongoDB. The project includes both a frontend React application and a backend Node.js API with a RESTful architecture.

## Project Structure
- `/src` - Frontend React application
  - `/components` - Reusable UI components
  - `/pages` - Page components
  - `/services` - API service functions
  - `/types` - TypeScript type definitions
- `/backend` - Backend Node.js API
  - `/controllers` - Route controller logic
  - `/middleware` - Custom middleware
  - `/models` - Mongoose data models
  - `/routes` - API route definitions

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local installation or MongoDB Atlas account)

### Quick Setup
1. Run the setup script to install all dependencies and seed the database:
   ```
   npm run setup
   ```

2. Start both frontend and backend servers with a single command:
   ```
   npm run start
   ```
   - The frontend will run on http://localhost:5173
   - The backend will run on http://localhost:5000

### Manual Setup

#### Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure environment variables:
   - The `.env` file should already be set up with default values
   - Update the MongoDB connection string in `.env` if needed

4. Seed the database with initial data:
   ```
   npm run seed
   ```

5. Start the backend server:
   ```
   npm run dev
   ```
   The server will run on http://localhost:5000

#### Frontend Setup
1. From the project root, install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```
   The application will run on http://localhost:5173

## API Endpoints

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get a specific project by ID
- `GET /api/projects/category/:keyword` - Get projects by category
- `POST /api/projects` - Create a new project
- `PUT /api/projects/:id` - Update a project
- `DELETE /api/projects/:id` - Delete a project

### Categories
- `GET /api/categories` - Get all categories
  - Query params:
    - `includeProjectCount=true` - Include project count for each category
- `GET /api/categories/:keyword` - Get a specific category by keyword
  - Query params:
    - `includeProjects=true` - Include related projects
- `POST /api/categories` - Create a new category
- `PUT /api/categories/:id` - Update a category
- `DELETE /api/categories/:id` - Delete a category

### Gallery
- `GET /api/gallery` - Get all gallery images
- `GET /api/gallery/category/:category` - Get gallery images by category
- `GET /api/gallery/:id` - Get a specific gallery image by ID
- `POST /api/gallery` - Create a new gallery image
- `PUT /api/gallery/:id` - Update a gallery image
- `DELETE /api/gallery/:id` - Delete a gallery image

## Technology Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Framer Motion, React Router
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **API Communication**: Axios
- **Development Tools**: Vite, Nodemon, ESLint

## Scripts
- `npm run dev` - Start the frontend development server
- `npm run backend` - Start the backend development server
- `npm run start` - Start both frontend and backend servers concurrently
- `npm run setup` - Install dependencies and seed the database
- `npm run build` - Build the frontend for production
- `npm run preview` - Preview the production build locally