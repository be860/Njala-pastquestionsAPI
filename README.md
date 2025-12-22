<div align="center">

# 📚 Njala Past Questions API

### A Modern Academic Document Management System

[![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?style=for-the-badge&logo=dotnet)](https://dotnet.microsoft.com/)
[![ASP.NET Core](https://img.shields.io/badge/ASP.NET_Core-8.0-512BD4?style=for-the-badge&logo=dotnet)](https://dotnet.microsoft.com/apps/aspnet)
[![SQL Server](https://img.shields.io/badge/SQL_Server-CC2927?style=for-the-badge&logo=microsoft-sql-server&logoColor=white)](https://www.microsoft.com/sql-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

A comprehensive RESTful API for managing academic documents (past questions, research papers, exam preparation materials) at Njala University. Built with modern security practices, role-based access control, and enterprise-grade features.

[Features](#-features) • [Quick Start](#-quick-start) • [API Documentation](#-api-documentation) • [Deployment](#-deployment)

</div>

---

## 🌟 Overview

The Njala Past Questions API is a production-ready backend system designed to streamline academic document management for universities. It provides secure authentication, role-based access control, comprehensive auditing, and seamless document handling capabilities.

### Key Highlights

- 🔐 **Enterprise Security**: JWT authentication, OAuth 2.0 integration, and encrypted password storage
- 👥 **Role-Based Access**: Multi-tier authorization (Super Admin, Admin, Student)
- 📄 **Document Management**: Upload, download, and track academic materials with metadata
- 📊 **Analytics Dashboard**: Real-time statistics and usage tracking
- 🔍 **Audit Logging**: Complete accountability with detailed activity logs
- 📧 **Email Integration**: OTP verification and password reset workflows
- 🚀 **Modern Architecture**: Built on ASP.NET Core 8 with Entity Framework Core

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
| **Super Admin** | Full system access, manage admins, view global statistics |
| **Admin** | Manage documents, student accounts, and view analytics |
| **Student** | Access and download documents, view personal statistics |

### Document Management

- 📤 **File Upload** - Support for PDF and DOCX formats
- 📥 **Secure Downloads** - Track and log all download activities
- ✏️ **CRUD Operations** - Complete document lifecycle management
- 🏷️ **Rich Metadata** - Title, year, course code, department, and custom tags
- 🔍 **Search & Filter** - Advanced querying capabilities
- 📊 **Usage Analytics** - Download counts and popularity metrics

### Dashboard Features

#### Student Dashboard
- 📈 Personal download statistics
- 🕒 Recently accessed documents
- 🔎 Search with pagination
- 📚 Course-specific materials

#### Admin Dashboard
- 👥 User management (Students & Admins)
- 📊 System-wide statistics
- 📋 Audit log access
- 📈 Usage analytics

### Security & Compliance

- 🔒 **Secure Secret Management** - No credentials in source control
- 🛡️ **Data Encryption** - Passwords hashed with BCrypt
- 📝 **Comprehensive Auditing** - All sensitive actions logged
- 🚫 **GitHub Push Protection** - Prevents accidental secret leaks
- ✅ **CORS Configuration** - Controlled cross-origin access

---

## 🛠️ Technology Stack

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

---

## 📂 Project Structure

```
NjalaAPI/
├── Controllers/           # API endpoints
│   ├── AuthController.cs         # Authentication & authorization
│   ├── DocumentController.cs     # Document management
│   ├── StudentDashboardController.cs
│   ├── AdminController.cs        # Admin operations
│   ├── AuditController.cs        # Audit logs
│   └── StatsController.cs        # Statistics
├── Data/                  # Database context
│   └── ApplicationDbContext.cs
├── Models/                # Domain entities
│   ├── ApplicationUser.cs
│   ├── RefreshToken.cs
│   ├── Document.cs
│   ├── AuditLog.cs
│   └── ...
├── Services/              # Business logic
│   ├── IEmailService.cs
│   ├── EmailService.cs
│   ├── IAuditService.cs
│   ├── AuditService.cs
│   └── ...
├── DTOs/                  # Data transfer objects
│   ├── AuthDtos.cs
│   ├── DocumentDtos.cs
│   ├── AuditLogDto.cs
│   └── ...
├── Migrations/            # EF Core migrations
├── Extensions/            # Extension methods
├── UploadedFiles/         # Document storage
├── UploadedAvatars/       # User avatars
├── wwwroot/               # Static files
├── appsettings.json       # Configuration (no secrets)
├── appsettings.sample.json # Configuration template
└── Program.cs             # Application entry point
```

---

## ⚙️ Quick Start

### Prerequisites

- [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [SQL Server](https://www.microsoft.com/sql-server) (LocalDB, Express, or Full)
- [Git](https://git-scm.com/)
- A code editor ([Visual Studio](https://visualstudio.microsoft.com/), [VS Code](https://code.visualstudio.com/), or [Rider](https://www.jetbrains.com/rider/))

### Installation

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

#### 6️⃣ Run the Application

```bash
dotnet run
```

The API will be available at:
- **HTTPS**: `https://localhost:5001`
- **HTTP**: `http://localhost:5000`
- **Swagger UI**: `https://localhost:5001/swagger`

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

## 🧪 Testing

### Using Swagger UI

1. Navigate to `https://localhost:5001/swagger`
2. Click "Authorize" and enter your JWT token
3. Test endpoints interactively

### Using Postman

1. Import the API collection (create from Swagger JSON)
2. Set up environment variables:
   - `baseUrl`: `https://localhost:5001`
   - `token`: Your JWT token
3. Test endpoints with pre-configured requests

### Using cURL

```bash
# Login
curl -X POST https://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@njala.edu","password":"Pass123!"}'

# Get documents (with token)
curl -X GET https://localhost:5001/api/document \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🔐 Security Best Practices

### Secret Management

- ✅ **Never commit secrets** to version control
- ✅ Use **User Secrets** for local development
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

---

## 🌍 Deployment

### Azure App Service

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

### Docker

1. **Create Dockerfile:**
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

2. **Build and run:**
   ```bash
   docker build -t njala-api .
   docker run -d -p 8080:80 --name njala-api-container njala-api
   ```

### Environment Variables (Production)

Set these in your hosting environment:

```bash
ConnectionStrings__DefaultConnection="Your-Production-Connection-String"
Jwt__Key="your-production-jwt-secret-key"
Jwt__Issuer="NjalaPastQA"
Jwt__Audience="NjalaStudents"
Authentication__Google__ClientId="your-google-client-id"
Authentication__Google__ClientSecret="your-google-client-secret"
EmailSettings__Password="your-smtp-password"
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

- Follow C# coding conventions
- Write unit tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

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
- Open-source community for valuable libraries

---

## 📞 Support

For issues, questions, or suggestions:

- 🐛 **Bug Reports**: [Open an issue](https://github.com/be860/Njala-pastquestionsAPI/issues)
- 💡 **Feature Requests**: [Start a discussion](https://github.com/be860/Njala-pastquestionsAPI/discussions)
- 📧 **Email**: benjaminturay592@gmail.com

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

Built with ❤️ for Njala University

</div>
