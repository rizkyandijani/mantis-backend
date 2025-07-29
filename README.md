# MANTIS Backend

MANTIS (Machine mainTenance Information System) is a web-based application for managing machine maintenance in a workshop environment. This repository contains the backend service that powers the MANTIS application.

## Technology Stack

- Node.js
- Express.js
- Prisma ORM
- PostgreSQL
- TypeScript

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn package manager

## Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
cd mantis-backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/mantis_db"

# JWT
JWT_SECRET="your-jwt-secret"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:3000/auth/google/callback"

# App
PORT=3000
NODE_ENV="development"
```

4. Set up the database:
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev
```

5. Start the development server:
```bash
npm run dev
```

## Database Schema

The application uses PostgreSQL with Prisma ORM. Key models include:

- User (Students, Instructors)
- Machine
- DailyMaintenance
- QuestionTemplate
- QuestionResponse

Refer to `prisma/schema.prisma` for the complete database schema.

## API Endpoints

### Authentication
- `POST /auth/login` - Login with email/password
- `GET /auth/google` - Google OAuth login
- `GET /auth/google/callback` - Google OAuth callback

### Machines
- `GET /machine` - Get all machines
- `GET /machine/:id` - Get machine by ID
- `POST /machine` - Create new machine
- `PUT /machine/:id` - Update machine
- `DELETE /machine/:id` - Delete machine

### Maintenance
- `GET /maintenance` - Get all maintenance records
- `GET /maintenance/:id` - Get maintenance record by ID
- `POST /maintenance` - Create new maintenance record
- `PUT /maintenance/:id/updateStatus` - Update maintenance status
- `GET /maintenance/yearly-recap` - Get yearly maintenance recap
- `GET /maintenance/monthly` - Get monthly maintenance records

### Questions
- `GET /question` - Get all question templates
- `POST /question` - Create new question template
- `PUT /question/:id` - Update question template
- `DELETE /question/:id` - Delete question template

## Authentication

The system uses JWT tokens for authentication. There are three user roles:
- `admin` - Full system access
- `instructor` - Can review and approve maintenance records
- `student` - Can submit maintenance records

## File Structure

```
mantis-backend/
├── src/
│   ├── controllers/    # Request handlers
│   ├── routes/        # API routes
│   ├── services/      # Business logic
│   ├── middleware/    # Custom middleware
│   ├── utils/         # Helper functions
│   └── app.ts         # App entry point
├── prisma/
│   └── schema.prisma  # Database schema
├── tests/            # Test files
└── package.json
```

## Development

### Running Tests
```bash
npm run test
```

### Linting
```bash
npm run lint
```

### Database Management
```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Reset database
npx prisma migrate reset

# View database in Prisma Studio
npx prisma studio
```

## Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request

## License

[MIT License](LICENSE)
