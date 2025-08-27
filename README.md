# Booking App Backend

This project implements a simplified backend for a booking application using Next.js API routes, Prisma ORM with PostgreSQL, and JWT for authentication.

## Tech Stack

- **Framework**: Next.js (API Routes)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JSON Web Tokens (JWT)
- **Password Hashing**: bcryptjs
- **Language**: TypeScript

## Setup and Run Instructions

1. **Clone the repository**:

    ```bash
    git clone <your-repo-url>
    cd booking-app
    ```

2. **Install dependencies**:

    ```bash
    npm install
    ```

3. **Set up Environment Variables**:

    Create a `.env` file in the root of the project and add the following:

    ```
    DATABASE_URL="postgresql://user:password@localhost:5432/bookingdb?schema=public"
    JWT_SECRET="your_jwt_secret_here"
    ```

    - Replace `user`, `password`, `localhost:5432`, and `bookingdb` with your PostgreSQL database credentials.
    - Replace `your_jwt_secret_here` with a strong, random secret for JWT signing.

4. **Set up the Database**:

    Ensure your PostgreSQL database is running and accessible. Then, run Prisma migrations to create the necessary tables:

    ```bash
    npx prisma migrate dev --name init
    ```

5. **Run the Development Server**:

    ```bash
    npm run dev
    ```

    The API will be accessible at `http://localhost:3000/api`.

## API Endpoints (Swagger Documentation)

[Hosted Swagger UI Link](http://localhost:3000/api-doc)
