<div align="center">

# 📚 Njala Past Questions API

### A Modern Academic Document Management System

[![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?style=for-the-badge&logo=dotnet)](https://dotnet.microsoft.com/)
[![ASP.NET Core](https://img.shields.io/badge/ASP.NET_Core-8.0-512BD4?style=for-the-badge&logo=dotnet)](https://dotnet.microsoft.com/apps/aspnet)
[![Next.js](https://img.shields.io/badge/Next.js-16.0-000000?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![SQL Server](https://img.shields.io/badge/SQL_Server-CC2927?style=for-the-badge&logo=microsoft-sql-server&logoColor=white)](https://www.microsoft.com/sql-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

A comprehensive full-stack application for managing academic documents (past questions, research papers, exam preparation materials) at Njala University. Built with modern security practices, role-based access control, and enterprise-grade features.

[Features](#-features) • [Quick Start](#-quick-start) • [API Documentation](#-api-documentation) • [Deployment](#-deployment)

</div>

---

## 🌟 Overview

The Njala Past Questions System is a production-ready full-stack application designed to streamline academic document management for universities. It provides secure authentication, role-based access control, comprehensive auditing, and seamless document handling capabilities with a modern, responsive user interface.

### Key Highlights

- 🔐 **Enterprise Security**: JWT authentication, OAuth 2.0 integration, and encrypted password storage
- 👥 **Role-Based Access**: Multi-tier authorization (Super Admin, Admin, Student)
- 📄 **Document Management**: Upload, download, and track academic materials with metadata
- 📊 **Analytics Dashboard**: Real-time statistics and usage tracking
- 🔍 **Audit Logging**: Complete accountability with detailed activity logs
- 📧 **Email Integration**: OTP verification and password reset workflows
- 🎨 **Modern UI**: Responsive Next.js frontend with Tailwind CSS and shadcn/ui
- 🚀 **Modern Architecture**: Built on ASP.NET Core 8 backend with Next.js 16 frontend

---

## 🚀 Features

### Authentication & Authorization

- ✅ **Email/Password Authentication** - Secure registration and login with BCrypt password hashing
- ✅ **Google OAuth 2.0** - Single sign-on integration with Google accounts
- ✅ **JWT Tokens** - Stateless authentication with access and refresh token support
- ✅ **OTP Email Verification** - Two-factor authentication via email
- ✅ **Password Reset Flow** - Secure password recovery mechanism
- ✅ **Role-Based Access Control** - Fine-grained permissions for different user types

### Role Management

| Role | Permissions |
|------|------------|
| **Super Admin** | Full system access, manage admins, view global statistics, audit logs |
| **Admin** | Manage documents, student accounts, and view analytics |
| **Student** | Access and download documents, view personal statistics |

### Document Management

- 📤 **File Upload** - Support for PDF and DOCX formats
- 📥 **Secure Downloads** - Track and log all download activities
- ✏️ **CRUD Operations** - Complete document lifecycle management
- 🏷️ **Rich Metadata** - Title, year, course code, department, and custom tags
- 🔍 **Search & Filter** - Advanced querying capabilities
- 📊 **Usage Analytics** - Download counts and popularity metrics
- 🤖 **AI Summaries** - Automatic document summarization

### Dashboard Features

#### Student Dashboard
- 📈 Personal download statistics
- 🕒 Recently accessed documents
- 🔎 Search with pagination and filters
- 📚 Course-specific materials
- 📊 Visual analytics with charts

#### Admin Dashboard
- 👥 User management (Students & Admins)
- 📊 System-wide statistics
- 📋 Document management interface
- 📈 Usage analytics
- 🔄 AI summary regeneration

#### Super Admin Dashboard
- 🌐 Global system statistics
- 📝 Comprehensive audit logs
- 👤 User and admin management
- 🔐 System-wide access control

### Security & Compliance

- 🔒 **Secure Secret Management** - No credentials in source control
- 🛡️ **Data Encryption** - Passwords hashed with BCrypt
- 📝 **Comprehensive Auditing** - All sensitive actions logged
- 🚫 **GitHub Push Protection** - Prevents accidental secret leaks
- ✅ **CORS Configuration** - Controlled cross-origin access
- 🔐 **Protected Routes** - Frontend and backend route protection

---

## 🛠️ Technology Stack

### Backend

| Category | Technology |
|----------|-----------|
| **Framework** | ASP.NET Core 8.0 Web API |
| **Database** | SQL Server with Entity Framework Core |
| **Authentication** | ASP.NET Core Identity, JWT Bearer, Google OAuth |
| **ORM** | Entity Framework Core (Code-First) |
| **Email** | SMTP (Gmail/Custom) |
| **Document Processing** | iTextSharp, DocumentFormat.OpenXml, PdfPig |
| **Security** | BCrypt.Net, .NET User Secrets |
| **API Documentation** | Swagger/OpenAPI (Swashbuckle) |
| **Messaging** | Twilio, Vonage (SMS capabilities) |

### Frontend

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 16.0 (React 19.2) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4.1 |
| **UI Components** | shadcn/ui (Radix UI) |
| **Forms** | React Hook Form + Zod validation |
| **State Management** | React Context API |
| **Icons** | Lucide React |
| **Charts** | Recharts |
| **Date Handling** | date-fns |
| **Theming** | next-themes (Dark/Light mode) |

---

## 📂 Project Structure

```
Njala-pastquestionsAPI/
├── backend/
│   ├── Controllers/           # API endpoints
│   │   ├── AuthController.cs         # Authentication & authorization
│   │   ├── DocumentController.cs     # Document management
│   │   ├── StudentDashboardController.cs
│   │   ├── AdminController.cs        # Admin operations
│   │   ├── AuditController.cs        # Audit logs
│   │   └── StatsController.cs        # Statistics
│   ├── Data/                  # Database context
│   │   └── ApplicationDbContext.cs
│   ├── Models/                # Domain entities
│   │   ├── ApplicationUser.cs
│   │   ├── RefreshToken.cs
│   │   ├── Document.cs
│   │   ├── AuditLog.cs
│   │   └── ...
│   ├── Services/              # Business logic
│   │   ├── IEmailService.cs
│   │   ├── EmailService.cs
│   │   ├── IAuditService.cs
│   │   ├── AuditService.cs
│   │   └── ...
│   ├── DTOs/                  # Data transfer objects
│   ├── Migrations/            # EF Core migrations
│   ├── Extensions/            # Extension methods
│   ├── UploadedFiles/         # Document storage
│   ├── UploadedAvatars/       # User avatars
│   ├── wwwroot/               # Static files
│   ├── appsettings.json       # Configuration (no secrets)
│   └── Program.cs             # Application entry point
│
└── frontend/
    ├── app/                   # Next.js App Router
    │   ├── admin/            # Admin dashboard pages
    │   ├── dashboard/        # Student dashboard pages
    │   ├── superadmin/       # Super admin pages
    │   ├── login/            # Login page
    │   ├── register/         # Registration page
    │   ├── verify-otp/       # OTP verification
    │   ├── layout.tsx        # Root layout
    │   └── page.tsx          # Landing page
    ├── components/            # Reusable UI components
    │   ├── ui/               # shadcn/ui components
    │   └── ...               # Custom components
    ├── contexts/              # React contexts
    │   └── AuthContext.tsx   # Authentication context
    ├── lib/                   # Utilities and API
    │   ├── api/              # API service layer
    │   │   ├── auth.ts
    │   │   ├── documents.ts
    │   │   ├── students.ts
    │   │   ├── admins.ts
    │   │   ├── dashboard.ts
    │   │   ├── audit.ts
    │   │   └── config.ts
    │   └── utils.ts          # Utility functions
    ├── styles/                # Global styles
    ├── public/                # Static assets
    ├── .env.local            # Environment variables (gitignored)
    ├── next.config.mjs       # Next.js configuration
    ├── tailwind.config.ts    # Tailwind configuration
    └── package.json          # Dependencies
```

---

## ⚙️ Quick Start

### Prerequisites

- [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/) and npm/pnpm
- [SQL Server](https://www.microsoft.com/sql-server) (LocalDB, Express, or Full)
- [Git](https://git-scm.com/)
- A code editor ([Visual Studio](https://visualstudio.microsoft.com/), [VS Code](https://code.visualstudio.com/), or [Rider](https://www.jetbrains.com/rider/))

### Backend Setup

#### 1️⃣ Clone the Repository

```bash
git clone https://github.com/be860/Njala-pastquestionsAPI.git
cd Njala-pastquestionsAPI
```

#### 2️⃣ Restore Dependencies

```bash
dotnet restore
```

#### 3️⃣ Configure Database Connection

Create or update `appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER;Database=NjalaPastQuestionsDB;Trusted_Connection=True;TrustServerCertificate=True;"
  }
}
```

**Example connection strings:**

```json
// SQL Server LocalDB
"Server=(localdb)\\mssqllocaldb;Database=NjalaPastQuestionsDB;Trusted_Connection=True;"

// SQL Server Express
"Server=.\\SQLEXPRESS;Database=NjalaPastQuestionsDB;Trusted_Connection=True;TrustServerCertificate=True;"

// SQL Server with credentials
"Server=YOUR_SERVER;Database=NjalaPastQuestionsDB;User Id=YOUR_USER;Password=YOUR_PASSWORD;TrustServerCertificate=True;"
```

#### 4️⃣ Apply Database Migrations

```bash
dotnet ef database update
```

This will create the database and all required tables.

#### 5️⃣ Configure Secrets (Development)

Initialize the secret store:

```bash
dotnet user-secrets init
```

Set required secrets:

```bash
# Google OAuth (optional, for Google login)
dotnet user-secrets set "Authentication:Google:ClientId" "YOUR_GOOGLE_CLIENT_ID"
dotnet user-secrets set "Authentication:Google:ClientSecret" "YOUR_GOOGLE_CLIENT_SECRET"

# Email SMTP (for OTP and notifications)
dotnet user-secrets set "EmailSettings:Password" "YOUR_SMTP_APP_PASSWORD"

# JWT Secret Key (recommended for production)
dotnet user-secrets set "Jwt:Key" "your-secure-secret-key-at-least-32-characters-long"
```

> **Note**: For Gmail SMTP, you need to generate an [App Password](https://support.google.com/accounts/answer/185833).

#### 6️⃣ Run the Backend

```bash
dotnet run
```

The API will be available at:
- **HTTPS**: `https://localhost:5001`
- **HTTP**: `http://localhost:5000`
- **Swagger UI**: `https://localhost:5001/swagger`

---

### Frontend Setup

#### 1️⃣ Navigate to Frontend Directory

```bash
cd frontend
```

#### 2️⃣ Install Dependencies

```bash
npm install
# or
pnpm install
```

#### 3️⃣ Configure Environment Variables

Create a `.env.local` file in the `frontend` directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://localhost:5001/api

# Google OAuth Configuration (optional)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
```

#### 4️⃣ Run the Frontend

```bash
npm run dev
# or
pnpm dev
```

The frontend will be available at:
- **Development**: `http://localhost:3000`

#### 5️⃣ Build for Production

```bash
npm run build
npm start
```

---

## 📖 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/register` | Register new user | ❌ |
| `POST` | `/api/auth/login` | Login with credentials | ❌ |
| `POST` | `/api/auth/google-login` | Login with Google OAuth | ❌ |
| `POST` | `/api/auth/request-otp` | Request OTP for verification | ❌ |
| `POST` | `/api/auth/verify-otp` | Verify OTP code | ❌ |
| `POST` | `/api/auth/refresh` | Refresh access token | ❌ |
| `POST` | `/api/auth/reset-password` | Reset user password | ❌ |
| `POST` | `/api/auth/logout` | Logout and invalidate tokens | ✅ |

### Document Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/document` | List all documents | ✅ |
| `GET` | `/api/document/{id}` | Get document details | ✅ |
| `POST` | `/api/document/upload` | Upload new document | ✅ (Admin) |
| `PUT` | `/api/document/{id}` | Update document | ✅ (Admin) |
| `DELETE` | `/api/document/{id}` | Delete document | ✅ (Admin) |
| `GET` | `/api/document/{id}/download` | Download document file | ✅ |

### Student Dashboard Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/student-dashboard/download-count` | Get user's download count | ✅ (Student) |
| `GET` | `/api/student-dashboard/documents/recent` | Get recently accessed documents | ✅ (Student) |
| `GET` | `/api/student-dashboard/download/{id}` | Download and track document | ✅ (Student) |

### Admin Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/admins` | List all admins | ✅ (Super Admin) |
| `POST` | `/api/admins` | Create new admin | ✅ (Super Admin) |
| `PUT` | `/api/admins/{id}` | Update admin | ✅ (Super Admin) |
| `DELETE` | `/api/admins/{id}` | Delete admin | ✅ (Super Admin) |
| `GET` | `/api/students` | List all students | ✅ (Admin) |
| `POST` | `/api/students` | Create new student | ✅ (Admin) |
| `PUT` | `/api/students/{id}` | Update student | ✅ (Admin) |
| `DELETE` | `/api/students/{id}` | Delete student | ✅ (Admin) |

### Audit & Statistics Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/audit/logs` | View audit logs | ✅ (Admin) |
| `GET` | `/api/stats/global` | Get system statistics | ✅ (Admin) |

### Example Requests

#### Register a New User

```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "student@njala.edu",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "Student"
}
```

#### Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "student@njala.edu",
  "password": "SecurePass123!"
}
```

**Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "user": {
    "id": "user-id-here",
    "email": "student@njala.edu",
    "firstName": "John",
    "lastName": "Doe",
    "role": "Student"
  }
}
```

#### Upload Document (Admin)

```bash
POST /api/document/upload
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data

{
  "file": [binary file data],
  "title": "Computer Science 101 - Past Questions 2023",
  "courseCode": "CS101",
  "year": 2023,
  "department": "Computer Science"
}
```

---

## 🎨 Frontend Features

### User Interface

- 🎨 **Modern Design**: Clean, professional UI with shadcn/ui components
- 🌓 **Dark/Light Mode**: Theme switching with next-themes
- 📱 **Responsive**: Mobile-first design that works on all devices
- ♿ **Accessible**: WCAG compliant with keyboard navigation
- 🎭 **Animations**: Smooth transitions and micro-interactions

### Pages & Routes

#### Public Routes
- `/` - Landing page
- `/login` - Login page with email/password and Google OAuth
- `/register` - User registration
- `/verify-otp` - OTP verification

#### Student Routes (`/dashboard/*`)
- `/dashboard` - Student dashboard with statistics
- `/dashboard/questions` - Browse and download documents
- `/dashboard/profile` - User profile management

#### Admin Routes (`/admin/*`)
- `/admin` - Admin dashboard with system stats
- `/admin/documents` - Document management
- `/admin/students` - Student management

#### Super Admin Routes (`/superadmin/*`)
- `/superadmin` - Super admin dashboard
- `/superadmin/users` - User management
- `/superadmin/audit` - Audit logs

### API Integration

All API calls are organized in `lib/api/`:

```typescript
// Example: Login
import { login } from '@/lib/api/auth';

const response = await login({
  email: 'student@njala.edu',
  password: 'SecurePass123!'
});
```

### Authentication Context

The `AuthContext` provides:
- User authentication state
- Login/logout functions
- Token management (stored in localStorage)
- Role-based access control
- Automatic token refresh

```typescript
import { useAuth } from '@/contexts/AuthContext';

const { user, login, logout, isAuthenticated } = useAuth();
```

---

## 🧪 Testing

### Backend Testing

#### Using Swagger UI

1. Navigate to `https://localhost:5001/swagger`
2. Click "Authorize" and enter your JWT token
3. Test endpoints interactively

#### Using Postman

1. Import the API collection (create from Swagger JSON)
2. Set up environment variables:
   - `baseUrl`: `https://localhost:5001`
   - `token`: Your JWT token
3. Test endpoints with pre-configured requests

#### Using cURL

```bash
# Login
curl -X POST https://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@njala.edu","password":"Pass123!"}'

# Get documents (with token)
curl -X GET https://localhost:5001/api/document \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Frontend Testing

1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:3000`
3. Test user flows:
   - Registration → OTP Verification → Login
   - Document browsing and download
   - Admin document management
   - Super admin user management

---

## 🔐 Security Best Practices

### Secret Management

- ✅ **Never commit secrets** to version control
- ✅ Use **User Secrets** for local development (backend)
- ✅ Use **.env.local** for local development (frontend)
- ✅ Use **Environment Variables** or **Azure Key Vault** in production
- ✅ Enable **GitHub Secret Scanning** and **Push Protection**

### Password Security

- ✅ Passwords hashed with **BCrypt** (salt rounds: 12)
- ✅ Minimum password requirements enforced
- ✅ Secure password reset with time-limited tokens

### API Security

- ✅ **JWT authentication** with configurable expiration
- ✅ **Refresh tokens** for extended sessions
- ✅ **CORS** configured for specific origins
- ✅ **HTTPS** enforced in production
- ✅ **Rate limiting** (recommended for production)

### Data Protection

- ✅ **SQL injection** prevention via EF Core parameterization
- ✅ **XSS protection** with proper input validation
- ✅ **File upload validation** (type, size, content)
- ✅ **Audit logging** for accountability
- ✅ **Protected routes** on frontend and backend

### Frontend Security

- ✅ **Token storage** in localStorage (consider httpOnly cookies for production)
- ✅ **Automatic logout** on token expiration
- ✅ **Route protection** based on user roles
- ✅ **Input sanitization** with Zod validation

---

## 🌍 Deployment

### Backend Deployment

#### Azure App Service

1. **Create Azure resources:**
   ```bash
   az group create --name NjalaAPI-RG --location eastus
   az sql server create --name njala-sql-server --resource-group NjalaAPI-RG --location eastus --admin-user sqladmin --admin-password YourPassword123!
   az sql db create --resource-group NjalaAPI-RG --server njala-sql-server --name NjalaPastQuestionsDB --service-objective S0
   az webapp create --resource-group NjalaAPI-RG --plan NjalaAPI-Plan --name njala-api --runtime "DOTNET|8.0"
   ```

2. **Configure connection string:**
   ```bash
   az webapp config connection-string set --resource-group NjalaAPI-RG --name njala-api --settings DefaultConnection="Server=tcp:njala-sql-server.database.windows.net,1433;Database=NjalaPastQuestionsDB;User ID=sqladmin;Password=YourPassword123!;Encrypt=True;" --connection-string-type SQLAzure
   ```

3. **Deploy:**
   ```bash
   dotnet publish -c Release
   az webapp deployment source config-zip --resource-group NjalaAPI-RG --name njala-api --src publish.zip
   ```

#### Docker

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["NjalaAPI.csproj", "./"]
RUN dotnet restore "NjalaAPI.csproj"
COPY . .
RUN dotnet build "NjalaAPI.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "NjalaAPI.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "NjalaAPI.dll"]
```

```bash
docker build -t njala-api .
docker run -d -p 8080:80 --name njala-api-container njala-api
```

### Frontend Deployment

#### Vercel (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   cd frontend
   vercel
   ```

3. **Set environment variables in Vercel dashboard:**
   - `NEXT_PUBLIC_API_URL`: Your production API URL
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: Google OAuth client ID

#### Docker

```dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
```

```bash
docker build -t njala-frontend .
docker run -d -p 3000:3000 --name njala-frontend-container njala-frontend
```

#### Static Export (Optional)

```bash
npm run build
# Deploy the 'out' directory to any static hosting service
```

### Environment Variables (Production)

**Backend:**
```bash
ConnectionStrings__DefaultConnection="Your-Production-Connection-String"
Jwt__Key="your-production-jwt-secret-key"
Jwt__Issuer="NjalaPastQA"
Jwt__Audience="NjalaStudents"
Authentication__Google__ClientId="your-google-client-id"
Authentication__Google__ClientSecret="your-google-client-secret"
EmailSettings__Password="your-smtp-password"
```

**Frontend:**
```bash
NEXT_PUBLIC_API_URL="https://your-api-domain.com/api"
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your-google-client-id"
```

---

## 📊 Database Schema

### Key Tables

- **AspNetUsers** - User accounts and authentication
- **AspNetRoles** - User roles (Student, Admin, SuperAdmin)
- **Documents** - Academic document metadata
- **RefreshTokens** - JWT refresh token storage
- **AuditLogs** - System activity tracking

### Migrations

```bash
# Create new migration
dotnet ef migrations add MigrationName

# Apply migrations
dotnet ef database update

# Rollback migration
dotnet ef database update PreviousMigrationName

# Remove last migration
dotnet ef migrations remove
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow C# coding conventions for backend
- Follow TypeScript/React best practices for frontend
- Write unit tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR
- Use meaningful commit messages

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Francis Benjamin Turay**  
BSc. Computer Science, Njala University

- GitHub: [@be860](https://github.com/be860)
- Email: benjaminturay592@gmail.com

---

## 🙏 Acknowledgments

- Njala University for project inspiration
- ASP.NET Core team for excellent documentation
- Next.js and Vercel for amazing frontend tools
- shadcn/ui for beautiful UI components
- Open-source community for valuable libraries

---

## 📞 Support

For issues, questions, or suggestions:

- 🐛 **Bug Reports**: [Open an issue](https://github.com/be860/Njala-pastquestionsAPI/issues)
- 💡 **Feature Requests**: [Start a discussion](https://github.com/be860/Njala-pastquestionsAPI/discussions)
- 📧 **Email**: benjaminturay592@gmail.com

---

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced search with Elasticsearch
- [ ] Real-time notifications with SignalR
- [ ] Document versioning
- [ ] Collaborative annotations
- [ ] Integration with university LMS
- [ ] Multi-language support
- [ ] Advanced analytics dashboard

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

Built with ❤️ for Njala University

</div>
