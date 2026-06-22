# Production Environment Variables for Frontend

This file provides a template for configuring the frontend application in production.

## Setup Instructions

1. Create a file named `.env.production` in the `frontend` directory
2. Copy the content below into that file
3. Replace all placeholder values with your actual production values

## Template Content

```env
# API Configuration
# Replace with your actual production API URL
NEXT_PUBLIC_API_URL=https://your-domain.com/api

# Google OAuth Configuration (Optional)
# Get these from Google Cloud Console
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

## Configuration Notes

### NEXT_PUBLIC_API_URL
- This should point to your production API endpoint
- Must match the domain configured in Nginx
- Do NOT include a trailing slash
- Example: `https://njala.edu/api` or `https://api.njala.edu`

### NEXT_PUBLIC_GOOGLE_CLIENT_ID
- Required only if using Google OAuth authentication
- Obtain from [Google Cloud Console](https://console.cloud.google.com/)
- Must match the Client ID configured in the backend
- Should end with `.apps.googleusercontent.com`

## Security Considerations

- **Never commit `.env.production` to version control**
- The `.env.production` file is already listed in `.gitignore`
- Store production secrets securely (e.g., password manager, secrets vault)
- Use different credentials for development and production

## Verification

After creating `.env.production`, verify:
1. File is in the correct location: `frontend/.env.production`
2. All placeholder values are replaced
3. API URL is accessible from your deployment server
4. Google Client ID matches backend configuration (if using OAuth)

## Build Process

The values in `.env.production` will be used when running:
```bash
npm run build
```

These environment variables are embedded into the build at build time, not runtime.
