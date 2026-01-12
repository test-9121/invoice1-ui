# Authentication Integration Documentation

## Overview

This application now includes full authentication integration with the backend API. The authentication system supports:

- ✅ User Registration (Signup)
- ✅ User Login
- ✅ Token Refresh
- ✅ Logout (single device)
- ✅ Logout All Devices
- ✅ Forgot Password
- ✅ Reset Password
- ✅ Change Password
- ✅ Protected Routes
- ✅ Automatic Token Refresh on 401

## Setup

### 1. Environment Configuration

Create a `.env` file in the root directory:

```bash
VITE_API_BASE_URL=http://localhost:8080
```

### 2. Test Credentials

Use these credentials to test the application:

- **Email**: `demo@invoice.com`
- **Password**: `password`
- **Role**: `INVOICE_ADMIN`

## Architecture

### Files Structure

```
src/
├── types/
│   └── auth.ts                 # TypeScript types for authentication
├── lib/
│   └── api-client.ts           # API client with token refresh
├── services/
│   └── auth.service.ts         # Authentication service
├── contexts/
│   └── AuthContext.tsx         # Auth context & provider
├── components/
│   └── ProtectedRoute.tsx      # Protected route wrapper
└── pages/
    ├── LoginPage.tsx           # Login/Signup page
    ├── ForgotPassword.tsx      # Password recovery
    └── ResetPassword.tsx       # Password reset with token
```

### Key Components

#### 1. API Client (`src/lib/api-client.ts`)
- Handles all HTTP requests
- Automatically adds Authorization headers
- Implements token refresh on 401 responses
- Queues requests during token refresh

#### 2. Auth Service (`src/services/auth.service.ts`)
- Manages all authentication API calls
- Handles token storage in localStorage
- Provides utility methods for token management

#### 3. Auth Context (`src/contexts/AuthContext.tsx`)
- Global authentication state management
- Provides hooks for login, register, logout
- Handles automatic token refresh on app init

#### 4. Protected Route (`src/components/ProtectedRoute.tsx`)
- Guards routes that require authentication
- Redirects to login if not authenticated
- Shows loading state during auth check

## Usage

### Login

```tsx
import { useAuth } from '@/contexts/AuthContext';

function LoginComponent() {
  const { login } = useAuth();
  
  const handleLogin = async () => {
    try {
      await login(email, password);
      // Navigate to dashboard
    } catch (error) {
      // Handle error
    }
  };
}
```

### Register

```tsx
const { register } = useAuth();

await register(email, password, firstName, lastName);
```

### Logout

```tsx
const { logout } = useAuth();

await logout();
```

### Access User Info

```tsx
const { user, isAuthenticated } = useAuth();

if (isAuthenticated) {
  console.log(user.firstName, user.email);
}
```

### Protected API Calls

```tsx
import { apiClient } from '@/lib/api-client';

// Third parameter (true) includes Authorization header
const data = await apiClient.get('/api/v1/protected-resource', true);
```

## Token Management

### Token Storage
- **Access Token**: Stored in localStorage
- **Refresh Token**: Stored in localStorage

### Token Refresh Flow
1. API request returns 401 Unauthorized
2. API client automatically attempts token refresh
3. If refresh succeeds, original request is retried
4. If refresh fails, user is redirected to login

### Security Considerations
- Tokens are stored in localStorage (consider httpOnly cookies for production)
- Access tokens expire after 24 hours (configurable on backend)
- Refresh tokens are rotated on each refresh

## API Endpoints

All authentication endpoints use base path: `/api/v1/auth`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/register` | POST | Register new user |
| `/login` | POST | Login with credentials |
| `/refresh` | POST | Refresh access token |
| `/logout` | POST | Logout from current device |
| `/logout-all` | POST | Logout from all devices |
| `/forgot-password` | POST | Request password reset |
| `/reset-password` | POST | Reset password with token |
| `/change-password` | POST | Change password (authenticated) |

## Features

### 1. Login Page
- Toggle between Login and Signup
- Form validation
- Error handling with toast notifications
- Remember attempted URL for redirect after login

### 2. Password Recovery
- Forgot password flow with email
- Reset password with token from email
- Success confirmation screens

### 3. Protected Routes
- All dashboard routes are protected
- Automatic redirect to login if not authenticated
- Preserves attempted URL for post-login redirect

### 4. Logout
- Logout button in sidebar
- Clears tokens and user state
- Redirects to login page

## Error Handling

The application includes comprehensive error handling:

- API errors are caught and displayed via toast notifications
- Token refresh failures redirect to login
- Network errors are logged to console
- Form validation errors are shown inline

## Development

### Adding New Protected Endpoints

```tsx
// In your service file
import { apiClient } from '@/lib/api-client';

export const fetchProtectedData = async () => {
  return apiClient.get('/api/v1/your-endpoint', true); // true = include auth
};
```

### Adding New Protected Routes

```tsx
// In App.tsx
<Route element={
  <ProtectedRoute>
    <YourLayout />
  </ProtectedRoute>
}>
  <Route path="/your-route" element={<YourComponent />} />
</Route>
```

## Testing

1. Start the backend server
2. Update `.env` with backend URL
3. Run the frontend: `npm run dev`
4. Test with demo credentials:
   - Email: `demo@invoice.com`
   - Password: `password`

## Future Enhancements

- [ ] Remember me functionality
- [ ] Social authentication (Google, Microsoft)
- [ ] Two-factor authentication
- [ ] Session timeout warnings
- [ ] Biometric authentication
- [ ] Role-based access control (RBAC)

## Troubleshooting

### "Failed to fetch" error
- Ensure backend server is running
- Check VITE_API_BASE_URL in .env
- Verify CORS is enabled on backend

### Token refresh loop
- Clear localStorage
- Check backend refresh token validation
- Verify token expiration times

### Not redirecting after login
- Check browser console for errors
- Verify ProtectedRoute is wrapping routes
- Check AuthContext initialization

---

**Last Updated**: January 9, 2026
