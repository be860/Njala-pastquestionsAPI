# Frontend-Backend Integration Guide

This guide explains how the frontend is connected to the ASP.NET backend API.

## Environment Variables

Create a `.env.local` file in the `frontend` directory with the following variables:

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://localhost:5001/api

# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
```

## API Integration

### Authentication
- **Login**: `/api/auth/login` - Email/password authentication
- **Register**: `/api/auth/register` - User registration
- **Google Login**: `/api/auth/google-login` - Google OAuth authentication
- **OTP Verification**: `/api/auth/verify-otp` - Email verification
- **Request OTP**: `/api/auth/request-otp` - Request verification code

### Student Dashboard
- **Get Dashboard Stats**: `/api/student-dashboard/download-count`, `/api/student-dashboard/documents/count`, `/api/student-dashboard/documents/recent`
- **Download Document**: `/api/student-dashboard/download/{id}`

### Admin Dashboard
- **Get Documents**: `/api/document` - List all documents with pagination
- **Upload Document**: `/api/document/upload` - Upload new document
- **Delete Document**: `/api/document/{id}` - Delete document
- **Get Students**: `/api/students` - List all students
- **Delete Student**: `/api/students/{id}` - Delete student

### SuperAdmin Dashboard
- **Get Global Stats**: `/api/stats/global` - System-wide statistics
- **Get Audit Logs**: `/api/audit/logs` - System audit logs
- **Get Users**: `/api/superadmin/users` - List all users
- **Manage Admins**: `/api/admins` - CRUD operations for admins

## Features Implemented

### 1. Authentication Flow
- ✅ Email/password login
- ✅ Google Sign-In integration
- ✅ User registration with email verification
- ✅ OTP verification screen
- ✅ Protected routes based on user roles

### 2. Student Dashboard
- ✅ Real-time dashboard statistics
- ✅ Recent documents display
- ✅ Document download functionality
- ✅ Questions browsing with filters

### 3. Admin Dashboard
- ✅ Document management (upload, delete, view)
- ✅ Student management (view, delete)
- ✅ Dashboard statistics
- ✅ AI summary regeneration

### 4. SuperAdmin Dashboard
- ✅ System-wide statistics
- ✅ Audit log viewing
- ✅ User management
- ✅ Admin management

## API Service Files

All API calls are organized in the `lib/api/` directory:
- `auth.ts` - Authentication endpoints
- `documents.ts` - Document management
- `students.ts` - Student management
- `admins.ts` - Admin management
- `dashboard.ts` - Dashboard data
- `audit.ts` - Audit logs
- `superadmin.ts` - SuperAdmin operations
- `config.ts` - API configuration and utilities

## Authentication Context

The `AuthContext` (`contexts/AuthContext.tsx`) provides:
- User authentication state
- Login/logout functions
- Token management
- Role-based access control

## Role-Based Routing

- **Student**: `/dashboard/*`
- **Admin**: `/admin/*`
- **SuperAdmin**: `/superadmin/*`

## CORS Configuration

Make sure the backend CORS is configured to allow requests from the frontend. The backend should have:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});
```

## Google Sign-In Setup

1. Get Google OAuth credentials from [Google Cloud Console](https://console.cloud.google.com/)
2. Add the Client ID to `.env.local`
3. Configure authorized JavaScript origins and redirect URIs in Google Console
4. The frontend will automatically initialize Google Sign-In when the page loads

## Notes

- All API requests include JWT tokens in the Authorization header
- Tokens are stored in localStorage
- The frontend automatically redirects unauthenticated users to the login page
- Role-based access is enforced on both frontend and backend

