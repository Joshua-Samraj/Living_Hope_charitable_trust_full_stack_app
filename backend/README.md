# Living Hope Trust Backend API

This is the backend API for the Living Hope Trust website. It provides endpoints for projects, categories, and gallery images. The API is built with Express.js and MongoDB.

## Setup

1. Install dependencies:
   ```
   cd backend
   npm install
   ```

2. Set up MongoDB:
   - Make sure MongoDB is installed and running on your system
   - Or use MongoDB Atlas for cloud hosting

3. Configure environment variables:
   - Create a `.env` file in the backend directory (already done)
   - Set `MONGODB_URI` to your MongoDB connection string
   - Set `PORT` to the desired port number (default: 5000)

4. Seed the database with initial data:
   ```
   npm run seed
   ```

5. Start the server:
   ```
   npm run dev
   ```

## Project Structure

```
backend/
├── controllers/       # Controller logic for routes
├── middleware/        # Custom middleware
├── models/            # Mongoose models
├── routes/            # API route definitions
├── .env               # Environment variables
├── package.json       # Project dependencies
├── seed.js            # Database seeding script
├── server.js          # Main application entry point
```

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

## Error Handling

The API includes global error handling middleware that provides consistent error responses across all endpoints. Error responses include:

```json
{
  "message": "Error message",
  "stack": "Error stack trace (only in development)"
}
```