# Water Management App - Backend

This directory contains the Node.js, Express, and MongoDB backend for the Water Management App.

## Prerequisites

- Node.js (v16 or later recommended)
- npm
- MongoDB instance (local or cloud-hosted, e.g., MongoDB Atlas)

## Setup

1.  **Clone the repository (if you haven't already).**
2.  **Navigate to this `backend` directory:**
    ```bash
    cd backend
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    ```
4.  **Create a `.env` file** in this `backend` directory.
    Copy the contents from `.env.example` (if one exists) or use the following template:

    ```env
    MONGO_URI=mongodb://localhost:27017/waterManagementApp
    PORT=3000
    JWT_SECRET=yourSuperSecretJWTKey123!@#
    # NODE_ENV=development
    ```

    Replace `yourSuperSecretJWTKey123!@#` with a strong, unique secret. 
    Update `MONGO_URI` if your MongoDB instance is not running on the default local port.

## Running the Server

-   **Development mode (with nodemon for auto-restarts):**
    ```bash
    npm run dev
    ```
-   **Production mode:**
    ```bash
    npm start
    ```

The server will typically start on `http://localhost:3000` (or the port specified in your `.env` file).

## Project Structure

-   `server.js`: Main application file, sets up Express, connects to MongoDB, and mounts routes.
-   `models/`: Contains Mongoose schemas for database collections (User, Device, Category, Usage, Bill).
-   `controllers/`: Contains the business logic for each API endpoint.
-   `routes/`: Defines the API routes using Express Router.
-   `middleware/`: Contains custom middleware, such as JWT authentication.
-   `.env`: Stores environment variables (MongoDB URI, JWT secret, port, etc.). **This file should not be committed to version control.**
-   `package.json`: Lists project dependencies and scripts.

## API Endpoints

(Details of API endpoints will be added as they are developed.)

-   `/api/users`
-   `/api/categories`
-   `/api/devices`
-   `/api/usages`
-   `/api/bills`
-   `/api/dashboard`
-   `/api/test` 