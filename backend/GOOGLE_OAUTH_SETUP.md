# Google OAuth Configuration Guide

To enable Google Sign-In functionality, you need to configure your Google OAuth credentials. Follow these steps:

## Step 1: Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google+ API** (or **Google Identity Services API**)
4. Go to **Credentials** → **Create Credentials** → **OAuth client ID**
5. Choose **Web application** as the application type
6. Configure the OAuth consent screen if prompted

## Step 2: Configure Authorized JavaScript Origins

In the **Authorized JavaScript origins** section, add:

### For Development:
```
http://localhost:3000
http://localhost:3001
http://127.0.0.1:3000
```

### For Production:
```
https://yourdomain.com
https://www.yourdomain.com
```

**Important Notes:**
- Do NOT include trailing slashes (`/`)
- Use `http://` for localhost, `https://` for production
- Include all variations of your domain (with/without www)

## Step 3: Configure Authorized Redirect URIs

In the **Authorized redirect URIs** section, add:

### For Development:
```
http://localhost:3000
http://localhost:3001
http://127.0.0.1:3000
```

### For Production:
```
https://yourdomain.com
https://www.yourdomain.com
https://yourdomain.com/api/auth/google-login
```

**Important Notes:**
- The redirect URI should match your frontend URL
- For Next.js apps, typically just the base URL is needed
- The Google Sign-In JavaScript SDK handles the callback automatically

## Step 4: Get Your Client ID

1. After creating the OAuth client, copy the **Client ID**
2. Add it to your frontend `.env.local` file:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
```

## Step 5: Backend Configuration

The backend uses Google's token verification, so you don't need to configure the Client ID on the backend. The backend validates the JWT token sent from the frontend.

## Example Configuration

### Development Setup:
```
Authorized JavaScript origins:
- http://localhost:3000
- http://localhost:3001

Authorized redirect URIs:
- http://localhost:3000
- http://localhost:3001
```

### Production Setup:
```
Authorized JavaScript origins:
- https://njala-pastquestions.com
- https://www.njala-pastquestions.com

Authorized redirect URIs:
- https://njala-pastquestions.com
- https://www.njala-pastquestions.com
```

## Troubleshooting

### Common Issues:

1. **"Error 400: redirect_uri_mismatch"**
   - Make sure the redirect URI in Google Console matches exactly with your app URL
   - Check for trailing slashes or protocol mismatches (http vs https)

2. **"Invalid client ID"**
   - Verify `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set correctly in `.env.local`
   - Restart your Next.js dev server after adding environment variables

3. **"Popup blocked"**
   - Some browsers block popups. Make sure popups are allowed for your domain
   - The Google Sign-In button should trigger the popup automatically

4. **Profile photo not showing**
   - Ensure the Google account has a profile photo set
   - Check browser console for CORS errors
   - Verify the backend is correctly saving `payload.Picture` to `user.AvatarUrl`

## Security Notes

- Never commit your Client ID or Client Secret to version control
- Use environment variables for all sensitive configuration
- In production, ensure HTTPS is enabled
- Regularly rotate your OAuth credentials

## Testing

1. Start your Next.js development server: `npm run dev`
2. Navigate to the login page
3. Click the Google Sign-In button
4. Select a Google account
5. Verify that:
   - You are redirected to the appropriate dashboard
   - Your profile photo appears (if you have one)
   - Your name and email are correctly displayed
 
