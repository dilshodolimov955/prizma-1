# Prizma CRM - Telegram Registration System

## ✨ Features

### 🤖 Telegram Bot Registration
- **Step-by-Step Form** - Guided user registration with validation
- **Inline Keyboards** - User-friendly button-based navigation
- **Region-District Mapping** - Dynamic district selection based on region
- **Channel Subscription** - Verify minimum 2 channel subscriptions
- **Data Validation** - Email, phone, age validation at each step
- **Session Management** - Track user progress through registration
- **Database Integration** - Automatic data saving to PostgreSQL

### 🗄️ Complete CRM System
- **8 Core Modules** - Teacher, Student, Branch, Course, Group, Room, Staff, StudentGroup, TeacherGroup
- **REST API** - Full CRUD endpoints with validation
- **Photo Upload** - Profile pictures for Teacher and Student
- **Search & Filter** - Advanced search capabilities
- **Error Handling** - Comprehensive error management

## 🚀 Quick Start

### Prerequisites
```bash
# System requirements
- Node.js 18+
- PostgreSQL 13+
- npm or yarn
```

### Setup (5 minutes)

1. **Clone & Install**
```bash
git clone <repo-url>
cd prizma-1
npm install
```

2. **Configure Database**
```bash
# Create .env file
cat > .env << EOF
DATABASE_URL="postgresql://postgres:password@localhost:5432/prizma_db"
TELEGRAM_BOT_TOKEN="your_bot_token_here"
NODE_ENV="development"
PORT=3000
EOF
```

3. **Start PostgreSQL**
```bash
# Windows: Use pgAdmin or
docker run --name postgres -e POSTGRES_PASSWORD=password -d -p 5432:5432 postgres

# Create database
createdb prizma_db
```

4. **Run Migrations**
```bash
npx prisma generate
npx prisma migrate dev --name init
```

5. **Start Application**
```bash
npm run start:dev
```

## 📱 Telegram Bot Registration Flow

### User Journey
```
/start
  ↓
  📝 Ro'yxatdan o'tish (Register button)
  ↓
  Enter Name (min 2 chars)
  ↓
  Enter Age (10-120)
  ↓
  Enter Phone (+998XXXXXXXXX)
  ↓
  Select Region (13 regions)
  ↓
  Select District (region-specific)
  ↓
  Add Channels (min 2 required)
  ↓
  Review & Confirm
  ↓
  ✅ Success - Data saved to database
```

### Registration Data Saved
```json
{
  "id": 1,
  "telegramId": 123456789,
  "name": "Akmal Ibrohimov",
  "age": 25,
  "phone": "+998901234567",
  "region": "Tashkent City",
  "district": "Chilonzor",
  "channels": ["@channel1", "@channel2"],
  "status": "ACTIVE",
  "createdAt": "2024-12-12T10:30:00Z"
}
```

## 📊 Database Schema

### User Table (Telegram Registration)
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  telegramId BIGINT UNIQUE,
  name VARCHAR NOT NULL,
  age INT,
  phone VARCHAR UNIQUE,
  region VARCHAR,
  district VARCHAR,
  channels VARCHAR[],
  status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
  createdAt TIMESTAMP DEFAULT now(),
  updatedAt TIMESTAMP
);
```

### CRM Tables (8 models)
- **Branch** - Company branches (rooms, courses, groups)
- **Room** - Training facilities
- **Course** - Course catalog with levels
- **Group** - Student groups with teachers
- **Teacher** - Teachers with profile photo
- **Student** - Students with profile photo
- **Staff** - Administrative personnel
- **StudentGroup** - Many-to-many: Student ↔ Group
- **TeacherGroup** - Many-to-many: Teacher ↔ Group

## 🔑 Regions & Districts

### Available Regions (13)
```
✓ Tashkent City
✓ Andijan
✓ Bukhara
✓ Fergana
✓ Jizzakh
✓ Kashkadarya
✓ Navoi
✓ Namangan
✓ Samarkand
✓ Sirdarya
✓ Surkhandarya
✓ Tashkent Region
✓ Khorezm
```

Each region has 4-7 districts specific to that region.

## 🛠️ Development

### Build
```bash
npm run build          # Compile TypeScript
npm run start:dev      # Run in watch mode
npm run start:prod     # Run compiled version
```

### Database
```bash
npx prisma generate   # Regenerate Prisma Client
npx prisma migrate dev --name feature_name
npx prisma studio    # Open database GUI
```

### Testing
```bash
npm test
npm run test:cov
```

## 📝 API Endpoints

### User Registration (Telegram Only)
- **Telegram Bot** - `/start` command initiates registration flow
- **Webhook** - Telegram updates automatically processed
- **Database** - All data persisted to PostgreSQL

### CRM REST API
```
Teacher:
  POST   /teacher                # Create with photo upload
  GET    /teacher                # List all
  GET    /teacher/:id            # Get one
  PATCH  /teacher/:id            # Update
  DELETE /teacher/:id            # Delete

Student:
  POST   /student                # Create with photo upload
  GET    /student                # List all
  GET    /student/:id            # Get one
  PATCH  /student/:id            # Update
  DELETE /student/:id            # Delete

[Similar endpoints for Branch, Course, Group, Room, Staff, StudentGroup, TeacherGroup]
```

## 🐛 Troubleshooting

### "Cannot reach database server"
```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT 1;"

# Fix: Start PostgreSQL or update DATABASE_URL
```

### "TELEGRAM_BOT_TOKEN is not defined"
```bash
# Ensure .env file exists and has valid token
cat .env | grep TELEGRAM_BOT_TOKEN

# Get token from @BotFather on Telegram
```

### Build errors
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npx prisma generate
npm run build
```

### Registration not saving
```bash
# Check database connection
npx prisma db push

# View database state
npx prisma studio
```

## 🔐 Environment Variables

```env
# Required
DATABASE_URL=postgresql://user:password@host:5432/prizma_db
TELEGRAM_BOT_TOKEN=123456789:ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefgh

# Optional
NODE_ENV=development
PORT=3000
```

## 📦 Dependencies

```json
{
  "@nestjs/common": "^11.0.1",
  "@nestjs/core": "^11.0.1",
  "@prisma/client": "^6.19.0",
  "telegraf": "^4.16.0",
  "multer": "^1.4.5",
  "express": "^4.18.0"
}
```

## 📚 Architecture

### Modular Structure
```
src/modules/
├── branch/           # Branch management
├── course/           # Course catalog
├── group/            # Group management
├── room/             # Room booking
├── staff/            # Staff management
├── student/          # Student profiles
├── student-group/    # Student enrollment
├── teacher/          # Teacher profiles
└── teacher-group/    # Teacher assignment
```

### Telegram Layer
```
src/telegram/
├── telegram.service.ts    # Registration flow, handlers
└── telegram.module.ts     # Module definition
```

### Database Layer
```
src/prisma/
└── prisma.service.ts      # ORM service, connection management
```

## 🎯 Next Steps

1. **Deploy** - Use Docker or Railway/Heroku
2. **Scale** - Add more modules as needed
3. **Monitor** - Set up logging and error tracking
4. **Secure** - Implement authentication/authorization
5. **Test** - Add unit and integration tests

## 📄 License

MIT

## 👥 Support

For issues, please create a GitHub issue or contact the development team.

---

**Built with ❤️ using NestJS, Telegraf, and Prisma**
