# Google OAuth2 Authentication Setup

## Overview
The application now supports Google OAuth2 authentication. Users can log in using their Google account in addition to the standard email/password authentication.

## Changes Made

### 1. **LoginPage.tsx** - Added OAuth2 Handlers
- Added `handleGoogleLogin()` function that redirects to backend OAuth2 endpoint
- Added `handleMicrosoftLogin()` function for Microsoft OAuth2 (placeholder)
- Updated Google and Microsoft buttons with `onClick` handlers and `type="button"`

```typescript
const handleGoogleLogin = () => {
  window.location.href = 'http://localhost:8080/oauth2/authorization/google';
};
```

### 2. **OAuth2Callback.tsx** - New Callback Handler Page
Created a new page to handle OAuth2 redirects from the backend.

**Features:**
- Extracts `token` and `refreshToken` from URL query parameters
- Stores tokens in localStorage
- Redirects to dashboard on success
- Shows error messages and redirects to login on failure
- Displays loading spinner during authentication

**URL Format Expected:**
```
http://localhost:3000/oauth2/callback?token=ACCESS_TOKEN&refreshToken=REFRESH_TOKEN
```

### 3. **App.tsx** - Added OAuth2 Route
- Imported `OAuth2Callback` component
- Added route: `/oauth2/callback` → `<OAuth2Callback />`
- Added explicit `/login` route for consistency

## Backend Requirements

Your Spring Boot backend should have the following OAuth2 configuration:

### 1. **Dependencies (pom.xml or build.gradle)**
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-oauth2-client</artifactId>
</dependency>
```

### 2. **Application Properties**
```properties
# Google OAuth2
spring.security.oauth2.client.registration.google.client-id=YOUR_GOOGLE_CLIENT_ID
spring.security.oauth2.client.registration.google.client-secret=YOUR_GOOGLE_CLIENT_SECRET
spring.security.oauth2.client.registration.google.scope=openid,profile,email
spring.security.oauth2.client.registration.google.redirect-uri={baseUrl}/login/oauth2/code/{registrationId}

# OAuth2 Provider
spring.security.oauth2.client.provider.google.authorization-uri=https://accounts.google.com/o/oauth2/v2/auth
spring.security.oauth2.client.provider.google.token-uri=https://oauth2.googleapis.com/token
spring.security.oauth2.client.provider.google.user-info-uri=https://www.googleapis.com/oauth2/v3/userinfo
spring.security.oauth2.client.provider.google.user-name-attribute=sub
```

### 3. **Security Configuration**
Your Spring Security config should:
1. Allow `/oauth2/**` and `/login/oauth2/**` endpoints
2. Configure OAuth2 login with custom success handler
3. Generate JWT tokens after successful OAuth2 authentication
4. Redirect to frontend callback URL with tokens

**Example Success Handler:**
```java
@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, 
                                       HttpServletResponse response,
                                       Authentication authentication) throws IOException {
        // Generate JWT tokens
        String accessToken = jwtTokenProvider.generateAccessToken(authentication);
        String refreshToken = jwtTokenProvider.generateRefreshToken(authentication);
        
        // Redirect to frontend callback with tokens
        String redirectUrl = String.format(
            "http://localhost:3000/oauth2/callback?token=%s&refreshToken=%s",
            accessToken, refreshToken
        );
        
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
```

### 4. **OAuth2 Controller** (Optional - for authorization endpoint)
```java
@RestController
@RequestMapping("/oauth2")
public class OAuth2Controller {
    
    @GetMapping("/authorization/google")
    public void redirectToGoogle(HttpServletResponse response) throws IOException {
        // Spring Security will handle this automatically
        // This endpoint is just for documentation
        response.sendRedirect("/oauth2/authorization/google");
    }
}
```

## Google Cloud Console Setup

### 1. **Create OAuth2 Credentials**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Choose **Web application**

### 2. **Configure OAuth Consent Screen**
- Application name: "V-InvoGen" (or your app name)
- User support email: Your email
- Developer contact: Your email
- Scopes: Add `email`, `profile`, `openid`

### 3. **Authorized Redirect URIs**
Add these redirect URIs:
```
http://localhost:8080/login/oauth2/code/google
http://localhost:8080/oauth2/callback/google
```

### 4. **Get Credentials**
- Copy **Client ID**
- Copy **Client Secret**
- Add to your Spring Boot `application.properties`

## Frontend Environment Configuration

Create or update `.env` file:
```env
VITE_API_BASE_URL=http://localhost:8080
VITE_OAUTH2_REDIRECT_URI=http://localhost:3000/oauth2/callback
```

## Testing OAuth2 Flow

### 1. **Start Backend**
```bash
cd backend
./mvnw spring-boot:run
```

### 2. **Start Frontend**
```bash
cd frontend
npm run dev
```

### 3. **Test Login**
1. Navigate to `http://localhost:3000`
2. Click **Google** button
3. You'll be redirected to Google login
4. After successful authentication, you'll be redirected back to the app
5. Tokens will be stored and you'll be logged in

## Flow Diagram

```
User clicks "Google" button
    ↓
Frontend redirects to: http://localhost:8080/oauth2/authorization/google
    ↓
Spring Security redirects to: Google OAuth2 login page
    ↓
User logs in with Google
    ↓
Google redirects back to: http://localhost:8080/login/oauth2/code/google
    ↓
Spring Security processes OAuth2 authentication
    ↓
Backend generates JWT tokens
    ↓
Backend redirects to: http://localhost:3000/oauth2/callback?token=...&refreshToken=...
    ↓
Frontend OAuth2Callback page extracts tokens
    ↓
Tokens stored in localStorage
    ↓
User redirected to Dashboard
```

## Error Handling

The OAuth2Callback component handles these error scenarios:

1. **Missing tokens** - Redirects to login with error message
2. **Backend error parameter** - Shows error from backend
3. **Network errors** - Shows generic error message
4. **Invalid tokens** - Clears localStorage and redirects to login

## Security Considerations

1. **HTTPS in Production** - Always use HTTPS for OAuth2 in production
2. **Token Storage** - Consider using httpOnly cookies instead of localStorage
3. **CORS Configuration** - Ensure backend allows frontend origin
4. **Token Expiry** - Implement token refresh mechanism
5. **State Parameter** - Backend should validate OAuth2 state parameter
6. **PKCE** - Consider implementing PKCE for additional security

## Troubleshooting

### Issue: "Redirect URI mismatch"
**Solution:** Ensure redirect URI in Google Console matches exactly:
```
http://localhost:8080/login/oauth2/code/google
```

### Issue: "Invalid client ID"
**Solution:** 
- Check client ID in `application.properties`
- Verify Google Console credentials are active

### Issue: "CORS error"
**Solution:** Add CORS configuration in Spring Security:
```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowCredentials(true);
    configuration.setAllowedHeaders(Arrays.asList("*"));
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

### Issue: "Tokens not being stored"
**Solution:** 
- Check browser console for errors
- Verify URL contains `token` and `refreshToken` parameters
- Check localStorage in browser DevTools

## Next Steps

1. Configure Google OAuth2 credentials in Google Cloud Console
2. Add credentials to backend `application.properties`
3. Implement OAuth2 success handler in Spring Security
4. Test the complete flow
5. Add Microsoft OAuth2 support (similar setup)
6. Implement token refresh mechanism
7. Add user profile synchronization from OAuth2 provider

## Additional Resources

- [Spring Security OAuth2 Client Documentation](https://docs.spring.io/spring-security/reference/servlet/oauth2/client/index.html)
- [Google OAuth2 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [React Router Documentation](https://reactrouter.com/)
