# TODO: Fix Access Token Expiration Issue

## Steps to Complete
- [x] Modify `backend/src/middlewares/auth.middleware.js` to automatically refresh access token when expired using refresh token
- [x] Test the updated middleware to ensure it handles token refresh correctly
- [x] Verify that 401 errors for /api/v1/users/current-user are resolved
