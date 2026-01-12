# Testing Guide for Authentication Integration

## 🧪 Pre-Testing Checklist

- [ ] Backend server is running at `http://localhost:8080`
- [ ] `.env` file exists with `VITE_API_BASE_URL=http://localhost:8080`
- [ ] Frontend is running (`npm run dev`)
- [ ] Browser console is open for debugging

## 📝 Test Credentials

```
Email: demo@invoice.com
Password: password
Role: INVOICE_ADMIN
```

## 🔍 Test Cases

### Test 1: User Registration (Signup)
**Steps:**
1. Navigate to `http://localhost:5173`
2. Click "Sign Up" tab
3. Fill in:
   - First Name: John
   - Last Name: Doe
   - Email: john.doe@test.com
   - Password: Test123!
   - Confirm Password: Test123!
4. Click "Create Account"

**Expected Result:**
- ✅ Success toast: "Registration Successful"
- ✅ Redirect to `/dashboard`
- ✅ User logged in
- ✅ Sidebar shows with user options

**Error Cases to Test:**
- Empty fields → Validation error
- Mismatched passwords → Error toast
- Existing email → Backend error displayed

---

### Test 2: User Login
**Steps:**
1. Navigate to `http://localhost:5173`
2. Ensure "Login" tab is active
3. Enter:
   - Email: demo@invoice.com
   - Password: password
4. Click "Login"

**Expected Result:**
- ✅ Success toast: "Welcome back, Demo!"
- ✅ Redirect to `/dashboard`
- ✅ User authenticated
- ✅ Dashboard content visible

**Error Cases to Test:**
- Wrong password → Error toast
- Non-existent email → Error toast
- Empty fields → Validation error

---

### Test 3: Protected Routes
**Steps:**
1. Ensure you're logged out
2. Try navigating directly to:
   - `http://localhost:5173/dashboard`
   - `http://localhost:5173/voice-input`
   - `http://localhost:5173/clients`

**Expected Result:**
- ✅ Redirect to `/` (login page)
- ✅ After login, redirect back to intended page

**Then:**
1. Login with demo credentials
2. Try accessing protected routes

**Expected Result:**
- ✅ All routes accessible
- ✅ Content loads properly
- ✅ No redirects

---

### Test 4: Forgot Password Flow
**Steps:**
1. On login page, click "Forgot Password?"
2. Navigate to `/forgot-password`
3. Enter email: demo@invoice.com
4. Click "Send Reset Instructions"

**Expected Result:**
- ✅ Success message displayed
- ✅ "Check Your Email" screen shown
- ✅ Toast notification

**Note:** You need to check your email for the actual reset link. The link will be:
`http://localhost:5173/reset-password?token=RESET_TOKEN`

---

### Test 5: Reset Password
**Steps:**
1. Get reset token from email (or backend logs)
2. Navigate to: `http://localhost:5173/reset-password?token=YOUR_TOKEN`
3. Enter new password (min 8 characters)
4. Confirm new password
5. Click "Reset Password"

**Expected Result:**
- ✅ Success message: "Password Reset Successfully"
- ✅ Auto-redirect to login after 3 seconds
- ✅ Can login with new password

**Error Cases:**
- Invalid token → Error message
- Passwords don't match → Error toast
- Short password → Validation error

---

### Test 6: Token Refresh (Automatic)
**This happens automatically but you can test it:**

**Steps:**
1. Login successfully
2. Open browser DevTools → Network tab
3. Make an API request (navigate between pages)
4. Wait for access token to expire (24 hours normally, but you can test by manually modifying localStorage)

**To force test:**
1. Open browser console
2. Run: `localStorage.setItem('accessToken', 'invalid-token')`
3. Navigate to any protected page
4. Watch Network tab

**Expected Result:**
- ✅ First request gets 401
- ✅ Refresh endpoint called automatically
- ✅ Original request retried with new token
- ✅ Page loads normally
- ✅ User stays logged in

**If refresh fails:**
- ✅ Redirect to login page
- ✅ Tokens cleared

---

### Test 7: Logout
**Steps:**
1. Login with demo credentials
2. Navigate to dashboard
3. Click "Logout" in sidebar (bottom)

**Expected Result:**
- ✅ Toast: "Logged Out"
- ✅ Redirect to login page
- ✅ Cannot access protected routes anymore
- ✅ localStorage cleared (check DevTools)

---

### Test 8: Session Persistence
**Steps:**
1. Login with demo credentials
2. Close the browser tab
3. Open new tab
4. Navigate to `http://localhost:5173/dashboard`

**Expected Result:**
- ✅ Still logged in
- ✅ Dashboard loads without login prompt
- ✅ User data available

**Then:**
1. Logout
2. Close browser
3. Open new browser
4. Navigate to dashboard

**Expected Result:**
- ✅ Redirect to login
- ✅ Not authenticated

---

### Test 9: Multiple Tabs
**Steps:**
1. Login in Tab 1
2. Open Tab 2 → navigate to dashboard
3. Logout from Tab 1
4. Try to use Tab 2

**Expected Result:**
- ✅ Tab 2 should detect logout on next API call
- ✅ Redirect to login

---

### Test 10: Form Validation
**Test on Login Page:**
- Empty email → Error
- Invalid email format → Error
- Empty password → Error

**Test on Signup:**
- Empty fields → Error
- Invalid email → Error
- Password too short → Error
- Passwords don't match → Error

**Test on Forgot Password:**
- Empty email → Error
- Invalid email → Error

**Test on Reset Password:**
- Empty password → Error
- Short password → Error
- Passwords don't match → Error

---

### Test 11: Navigation Flow
**Steps:**
1. Start at `/`
2. Try to access `/dashboard` (should redirect to `/`)
3. Login
4. Should redirect to `/dashboard`
5. Click on sidebar items:
   - Dashboard → `/dashboard`
   - Create Invoice → `/voice-input`
   - Work Orders → `/work-orders`
   - Clients → `/clients`
   - Reports → `/reports`
   - Settings → `/settings`
6. Click Logout
7. Should redirect to `/`

**Expected Result:**
- ✅ All navigations work smoothly
- ✅ No console errors
- ✅ Proper redirects

---

### Test 12: Error Handling
**Test Backend Down:**
1. Stop backend server
2. Try to login

**Expected Result:**
- ✅ Error toast displayed
- ✅ User stays on login page
- ✅ No crashes

**Test Network Error:**
1. Disconnect internet
2. Try to login

**Expected Result:**
- ✅ Error toast displayed
- ✅ Graceful error handling

**Test Invalid Credentials:**
1. Try login with wrong password
2. Try login with non-existent email

**Expected Result:**
- ✅ Specific error messages
- ✅ No crashes

---

## 🔧 Debug Checklist

If something doesn't work, check:

### 1. Browser Console
- Look for error messages
- Check network requests
- Verify API responses

### 2. Network Tab
- Are requests going to correct URL?
- Check response status codes
- Verify request/response payloads

### 3. LocalStorage
```javascript
// In browser console
console.log('Access Token:', localStorage.getItem('accessToken'));
console.log('Refresh Token:', localStorage.getItem('refreshToken'));
```

### 4. Backend Logs
- Check if requests are reaching backend
- Verify token validation
- Check for CORS errors

### 5. Environment Variables
```bash
# Check .env file
cat .env
# Should show: VITE_API_BASE_URL=http://localhost:8080
```

---

## 📊 Test Results Template

```markdown
## Test Results - [Date]

### Test 1: User Registration
- [ ] Pass / [ ] Fail
- Notes: 

### Test 2: User Login
- [ ] Pass / [ ] Fail
- Notes: 

### Test 3: Protected Routes
- [ ] Pass / [ ] Fail
- Notes: 

### Test 4: Forgot Password
- [ ] Pass / [ ] Fail
- Notes: 

### Test 5: Reset Password
- [ ] Pass / [ ] Fail
- Notes: 

### Test 6: Token Refresh
- [ ] Pass / [ ] Fail
- Notes: 

### Test 7: Logout
- [ ] Pass / [ ] Fail
- Notes: 

### Test 8: Session Persistence
- [ ] Pass / [ ] Fail
- Notes: 

### Test 9: Multiple Tabs
- [ ] Pass / [ ] Fail
- Notes: 

### Test 10: Form Validation
- [ ] Pass / [ ] Fail
- Notes: 

### Test 11: Navigation Flow
- [ ] Pass / [ ] Fail
- Notes: 

### Test 12: Error Handling
- [ ] Pass / [ ] Fail
- Notes: 

---

### Issues Found:
1. 
2. 
3. 

### Recommendations:
1. 
2. 
3. 
```

---

## 🚀 Quick Smoke Test

**Fastest way to verify everything works:**

1. ✅ Start backend
2. ✅ Run `npm run dev`
3. ✅ Open `http://localhost:5173`
4. ✅ Login with `demo@invoice.com` / `password`
5. ✅ Verify dashboard loads
6. ✅ Click through sidebar items
7. ✅ Logout
8. ✅ Try accessing `/dashboard` → should redirect to login

**All steps work? ✨ You're good to go!**

---

## 📞 Support

If you encounter issues:

1. Check `AUTH_INTEGRATION.md` for detailed docs
2. Review `ARCHITECTURE_DIAGRAM.md` for system overview
3. Inspect browser console for errors
4. Verify backend API responses
5. Check CORS configuration on backend

---

**Testing Date**: _______________
**Tester**: _______________
**Backend Version**: _______________
**Frontend Version**: _______________
