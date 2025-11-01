# Citizens SP API

A Fastify REST API with PostgreSQL database support, built with TypeScript.

## Features

- Fastify web framework
- TypeScript for type safety
- PostgreSQL database integration
- Migration system for database schema management
- Statuses table with pre-filled data
- RESTful API endpoints

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- TypeScript 5.3+

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   
   Create a `.env` file in the root directory. See [ENV_VARIABLES.md](./ENV_VARIABLES.md) for all available environment variables.
   
   Minimum required configuration:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/citizens_db
   PORT=3000
   NODE_ENV=development
   ```

3. **Create the database:**
   ```bash
   createdb citizens_db
   ```
   Or use your preferred method to create a PostgreSQL database.

4. **Run migrations:**
   ```bash
   npm run migrate
   ```
   This will create the `statuses` table and populate it with initial data.

5. **Start the server:**
   ```bash
   npm run dev
   ```
   For production, first build the TypeScript code:
   ```bash
   npm run build
   npm start
   ```

## API Endpoints

### Health Check
- `GET /health` - Check server and database health

### Statuses
- `GET /statuses` - Get all statuses
- `GET /statuses/:id` - Get a specific status by ID
- `POST /statuses` - Create a new status
- `PUT /statuses/:id` - Update a status
- `DELETE /statuses/:id` - Delete a status

## Database Schema

### Statuses Table

The `statuses` table is created during migration with the following structure:

- `id` (SERIAL PRIMARY KEY)
- `name` (VARCHAR(255) UNIQUE NOT NULL)
- `description` (TEXT)
- `color` (VARCHAR(50))
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

Initial statuses are automatically populated based on the `Statuses` enum:
- ACTIVE (id: 1)
- INACTIVE (id: 2)
- PENDING (id: 3)
- DELETED (id: 4)
- APPROVED (id: 5)
- REJECTED (id: 6)
- ERROR (id: 7)
- ENABLED (id: 8)
- DISABLED (id: 9)

## Scripts

- `npm run dev` - Start development server with watch mode (using tsx)
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server (runs compiled JavaScript)
- `npm run migrate` - Run database migrations

## Project Structure

```
citizens-sp-api/
├── src/
│   ├── config/
│   │   └── database.ts       # Database connection configuration
│   ├── migrations/
│   │   ├── migrate.ts        # Migration runner
│   │   └── files/
│   │       └── 001_create_statuses_table.sql
│   ├── routes/
│   │   └── statuses.ts       # Statuses API routes
│   ├── types/
│   │   └── index.ts          # TypeScript type definitions
│   └── server.ts             # Main server file
├── dist/                     # Compiled JavaScript (generated)
├── .env                      # Environment variables (create this)
├── .gitignore
├── package.json
├── tsconfig.json             # TypeScript configuration
└── README.md
```

