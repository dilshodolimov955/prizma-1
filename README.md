# Prizma CRM System

Complete NestJS-based CRM system with Telegram bot integration, REST API endpoints, and photo upload functionality.

## Features

✅ **8 Database Modules**
- Branch Management
- Course Management
- Group Management
- Room Management
- Teacher Management
- Student Management
- Staff Management
- StudentGroup & TeacherGroup Relationships

✅ **REST API Endpoints**
- Full CRUD operations for all entities
- Photo upload support for Teacher and Student
- Search and filtering capabilities
- Error handling and validation

✅ **Telegram Bot**
- Interactive inline keyboards
- Step-by-step form flows
- Teacher and Student registration via Telegram
- List views for all entities
- Session management

✅ **Database**
- PostgreSQL with Prisma ORM
- Enum types for Status, CourseLevel, StaffRole
- Proper relationship management
- Database migrations support

## Project Structure

```
src/
├── modules/
│   ├── branch/
│   │   ├── branch.controller.ts
│   │   ├── branch.service.ts
│   │   ├── branch.module.ts
│   │   ├── dto/
│   │   │   ├── create-branch.dto.ts
│   │   │   └── update-branch.dto.ts
│   │   └── entities/
│   │       └── branch.entity.ts
│   ├── course/
│   ├── group/
│   ├── room/
│   ├── staff/
│   ├── student/
│   │   └── (photo upload support)
│   ├── student-group/
│   ├── teacher/
│   │   └── (photo upload support)
│   └── teacher-group/
├── telegram/
│   ├── telegram.service.ts      (User registration flow)
│   └── telegram.module.ts
├── prisma/
│   └── prisma.service.ts
├── app.module.ts
├── app.controller.ts
├── app.service.ts
└── main.ts

prisma/
├── schema.prisma               (9 models: 8 CRM + User)
└── migrations/
    └── [timestamp]_init/

uploads/                         (File storage for photos)
```

## Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd prizma-1
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
Copy `.env.example` to `.env` and update with your actual database credentials:
```env
# PostgreSQL connection string (Windows example)
DATABASE_URL="postgresql://postgres:password@localhost:5432/prizma_db"

# Or use this format for local PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/prizma_db"

TELEGRAM_BOT_TOKEN="your_bot_token_from_botfather"
NODE_ENV="development"
PORT=3000
```

4. **Start PostgreSQL server**
```bash
# Windows with pgAdmin or PostgreSQL installer
# Or use Docker:
docker run --name postgres -e POSTGRES_PASSWORD=password -d -p 5432:5432 postgres
```

5. **Create PostgreSQL database** (if not exists)
```bash
# Connect to PostgreSQL and run:
psql -U postgres -c "CREATE DATABASE prizma_db;"
```

6. **Generate Prisma Client**
```bash
npx prisma generate
```

7. **Run database migrations**
```bash
npx prisma migrate dev --name init
```

8. **Verify database setup**
```bash
npx prisma studio  # Opens Prisma Studio at http://localhost:5555
```

## Running the Application

### Development mode
```bash
npm run start:dev
```

### Production build
```bash
npm run build
npm run start:prod
```

## API Endpoints

### Branch Endpoints
- `POST /branch` - Create new branch
- `GET /branch` - Get all branches
- `GET /branch/:id` - Get branch by ID
- `PATCH /branch/:id` - Update branch
- `DELETE /branch/:id` - Delete branch

### Teacher Endpoints
- `POST /teacher` - Create teacher (with photo upload)
- `GET /teacher` - Get all teachers
- `GET /teacher/:id` - Get teacher by ID
- `PATCH /teacher/:id` - Update teacher
- `DELETE /teacher/:id` - Delete teacher
- `GET /teacher/search/:query` - Search teachers

### Student Endpoints
- `POST /student` - Create student (with photo upload)
- `GET /student` - Get all students
- `GET /student/:id` - Get student by ID
- `PATCH /student/:id` - Update student
- `DELETE /student/:id` - Delete student
- `GET /student/search/:query` - Search students

### Course Endpoints
- `POST /course` - Create course
- `GET /course` - Get all courses
- `GET /course/:id` - Get course by ID
- `PATCH /course/:id` - Update course
- `DELETE /course/:id` - Delete course

### Room Endpoints
- `POST /room` - Create room
- `GET /room` - Get all rooms
- `GET /room/:id` - Get room by ID
- `PATCH /room/:id` - Update room
- `DELETE /room/:id` - Delete room

### Group Endpoints
- `POST /group` - Create group
- `GET /group` - Get all groups
- `GET /group/:id` - Get group by ID
- `PATCH /group/:id` - Update group
- `DELETE /group/:id` - Delete group

### Staff Endpoints
- `POST /staff` - Create staff member
- `GET /staff` - Get all staff
- `GET /staff/:id` - Get staff by ID
- `PATCH /staff/:id` - Update staff
- `DELETE /staff/:id` - Delete staff

### StudentGroup Endpoints
- `POST /student-group` - Add student to group
- `GET /student-group` - Get all student-group relationships
- `PATCH /student-group/:id` - Update relationship
- `DELETE /student-group/:id` - Remove student from group

### TeacherGroup Endpoints
- `POST /teacher-group` - Add teacher to group
- `GET /teacher-group` - Get all teacher-group relationships
- `PATCH /teacher-group/:id` - Update relationship
- `DELETE /teacher-group/:id` - Remove teacher from group

## Telegram Bot Commands

### Registration Flow (`/start`)
Complete user registration with validation:
1. **Name Input** - Enter full name (minimum 2 characters)
2. **Age Input** - Enter age (10-120 years)
3. **Phone Input** - Enter phone number (+998XXXXXXXXX format)
4. **Region Selection** - Choose region from inline keyboard
5. **District Selection** - Choose district specific to selected region
6. **Channel Subscription** - Add minimum 2 channel subscriptions
   - Can add Telegram channel links (@channel or https://t.me/channel format)
   - Option to add multiple channels or skip after minimum 2
7. **Confirmation** - Review all data and confirm or cancel

### Database Storage
All registration data is automatically saved to the `users` table:
- Telegram ID (unique)
- Full Name
- Age
- Phone Number (unique)
- Region & District
- Subscribed Channels (array)
- Creation & Update Timestamps
- Status (ACTIVE/INACTIVE)

### Features
- ✅ **Step-by-step validation** - Each field is validated before proceeding
- ✅ **Inline keyboards** - User-friendly button-based navigation
- ✅ **Region-District mapping** - Districts update based on selected region
- ✅ **Channel subscription** - Verify user channel subscriptions
- ✅ **Session management** - Track user progress through registration
- ✅ **Data persistence** - All data saved to PostgreSQL via Prisma

### Usage Examples
- User starts bot: `/start`
- User selects: `📝 Ro'yxatdan o'tish` (Register)
- User enters: Name, Age, Phone
- User selects: Region from dropdown
- User selects: District from dropdown
- User adds: @channel1, @channel2 (minimum)
- User confirms: Review and confirm registration

## Technology Stack

- **Framework:** NestJS 11.0.1
- **Language:** TypeScript 5.7.3
- **Database:** PostgreSQL with Prisma ORM 6.19.0
- **Telegram Bot:** telegraf (Telegram Bot API wrapper)
- **File Upload:** multer
- **HTTP Server:** Express

## Database Models

### CRM Models (8 tables)
1. **Branch** - Organization branches
2. **Room** - Training rooms
3. **Course** - Course information
4. **Group** - Student groups
5. **Teacher** - Teachers with photo support
6. **Student** - Students with photo support
7. **Staff** - Administrative staff
8. **StudentGroup** - Student-Group relationships
9. **TeacherGroup** - Teacher-Group relationships

### User Model (1 table)
- **User** - Telegram bot user registration data
  - Fields: name, age, phone, region, district, channels array
  - Unique constraints: telegramId, phone
  - Status: ACTIVE/INACTIVE

### Enums
- **Status:** ACTIVE, INACTIVE
- **CourseLevel:** BEGINNER, INTERMEDIATE, ADVANCED
- **StaffRole:** ADMIN, MANAGER, RECEPTIONIST

## Development

### Generate API Docs
```bash
npm run build
```

### Run Tests
```bash
npm test
```

### Code Formatting
```bash
npm run format
```

## Docker Support (Optional)

```bash
docker-compose up -d
```

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env file
- Run migrations: `npx prisma migrate dev`

### Telegram Bot Not Working
- Verify TELEGRAM_BOT_TOKEN in .env
- Check Telegram API availability
- View bot logs in console

### Photo Upload Issues
- Ensure `/uploads` directory exists
- Check file permissions
- Verify multer configuration

## Contributors

Created for comprehensive CRM system with Telegram integration.

## License

MIT
