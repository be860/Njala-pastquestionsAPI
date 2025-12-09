# 📚 Njala Past Questions API

A full-featured ASP.NET Core Web API for managing academic documents (past questions, research papers, exam prep) at Njala University.
This project demonstrates modern backend practices including JWT authentication, role-based access control, Google OAuth integration, secure secret management, and auditing.


---

# 🚀 Features

 **Authentication & Authorization**

1. **Email/Password registration and login**

2. **Google OAuth login (with OAuth Client ID & Secret)**

3. **JWT access tokens + refresh tokens**

4. **OTP-based email verification**

5. **Password reset flow**


**Role-Based Access Control**

1. **Super Admin: Manages admins and global statistics**

2. **Admin: Manages documents and student accounts**

3. **Student: Accesses, downloads, and views documents**


**Document Management**

1. **Upload, update, delete documents (PDF/DOCX)**

2. **Download and track usage statistics**

3. **Metadata support (Title, Year, CourseCode, etc.)**


**Student Dashboard**

1. **Download counts**

2. **Recent documents**

3. **Search and pagination**


**Admin Dashboard**

1. **Manage students and admins (CRUD)

2. **View system-wide stats**

3. **Access audit logs for accountability**


**Auditing**

1. **Logs every sensitive action (user creation, login, document upload/delete)**

2. **Stored in SQL Server for reporting & monitoring**


**Secure Config Management**

1. **No secrets are committed to GitHub**

2. **All secrets managed with .NET User Secrets and environment variables**


---

# 🛠️ Tech Stack

1. **Framework: ASP.NET Core 8 Web API**

2. **Database: SQL Server (Entity Framework Core, Code-First Migrations)**

3. **Authentication: ASP.NET Core Identity, JWT, Google OAuth**

4. **Email Service: SMTP (Gmail, configurable)**

5. **Auditing: Custom AuditService with EF Core logging**

6. **Secrets Management: .NET User Secrets (for local dev)**

7. **Frontend (Example): Any SPA/Static app (tested with HTML/JS running at http://127.0.0.1:5500/)**


---

# 📂 Project Structure
```
NjalaAPI/
 ├── Controllers/        # API endpoints (Auth, Document, StudentDashboard, Admin, Audit, Stats)
 ├── Data/               # EF Core DbContext
 ├── Models/             # ApplicationUser, RefreshToken, Document, AuditLog, etc.
 ├── Services/           # EmailService, AuditService, JWT service
 ├── DTOs/               # Request/Response DTOs (Auth, ResetPassword, AuditLogDto, etc.)
 ├── Migrations/         # EF Core migrations
 ├── appsettings.json    # Placeholder config (no secrets)
 ├── Program.cs          # Startup pipeline
 └── wwwroot/            # Static files (optional)
```

---

# ⚙️ Setup & Installation

1️⃣ Clone the Repository
```
git clone https://github.com/be860/Njala-pastquestionsAPI.git
cd Njala-pastquestionsAPI
```

2️⃣ Install Dependencies
```
dotnet restore
```

3️⃣ Configure Database
```
Update your local connection string in appsettings.Development.json (or use User Secrets):

"ConnectionStrings": {
  "DefaultConnection": "Server=YOUR_SERVER;Database=NjalaPastQuestionsDB;Trusted_Connection=True;TrustServerCertificate=True;"
}
```

Run migrations:
```
dotnet ef database update
```

4️⃣ Manage Secrets (Development)

Initialize secret store:
```
dotnet user-secrets init

# Set your secrets (examples):

dotnet user-secrets set "Authentication:Google:ClientId" "<YOUR_GOOGLE_CLIENT_ID>"
dotnet user-secrets set "Authentication:Google:ClientSecret" "<YOUR_GOOGLE_CLIENT_SECRET>"
dotnet user-secrets set "EmailSettings:Password" "<YOUR_SMTP_PASSWORD>"
```

5️⃣ Run the Application
```
dotnet run
```
API will be available at:
```
👉 https://localhost:5001
```


---

# 🔑 Key Endpoints

**Auth**

1. **POST /api/auth/register – Register student/admin**

2. **POST /api/auth/login – Login with email/password**

3. **POST /api/auth/request-otp – Request OTP**

4. **POST /api/auth/verify-otp – Verify OTP**

5. **POST /api/auth/refresh – Refresh JWT**

6. **POST /api/auth/reset-password – Reset password**


**Documents**

GET /api/document – List documents

POST /api/document/upload – Upload document

PUT /api/document/{id} – Update document

DELETE /api/document/{id} – Delete document


**Student Dashboard**

1. **GET /api/student-dashboard/download-count**

2. **GET /api/student-dashboard/documents/recent**

3. **GET /api/student-dashboard/download/{id}**


**Admin**

1. **GET /api/admins / POST / PUT / DELETE**

2. **GET /api/students / POST / PUT / DELETE**


**Audit & Stats**

1. **GET /api/audit/logs – View audit logs**

2. |**GET /api/stats/global – System statistics**



---


# 🔐 Security

Sensitive data (Google OAuth, SMTP passwords, JWT keys) is not in source control.

Developers use User Secrets for local dev, and environment variables in production.

GitHub Push Protection is enabled to prevent accidental leaks.



---

# 🧪 Testing

Test endpoints via Postman or cURL.
Example login:
```
POST https://localhost:5001/api/auth/login
Content-Type: application/json

{
  "email": "student@njala.edu",
  "password": "Pass123!"
}

Returns:

{
  "token": "eyJhbGciOi...",
  "refreshToken": "a1b2c3d4...",
  "user": { "id": "...", "role": "Student" }
}

```
---

# 🌍 Deployment

Deployable to Azure App Service or Dockerized container.

SQL Server can run in Azure SQL or on-prem.

Replace secrets with production values via Key Vault or Environment Variables.



---

# 📜 License

This project is licensed under the MIT License.


---

# 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss your ideas.


---

# ✨ With this backend, Njala University can manage and distribute academic past questions securely and at scale.


---

# By Francis Benjamin Turay 
# Bsc. Computer Science Njala University 

