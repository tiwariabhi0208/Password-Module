import axios from "axios";

// The single Axios instance used by the entire application.
// baseURL means all API calls are relative: api.get('/vault/') becomes the full URL.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // Read from .env.local -- never hardcode URLs
  withCredentials: true, // Critical: tells the browser to send HttpOnly cookies cross-origin
});

// ============================================================
// ACCESS TOKEN STORAGE
// ============================================================
// The access token lives ONLY here -- a module-level variable.
// Why NOT localStorage: any JavaScript on the page can read localStorage.
//   An XSS attack: localStorage.getItem('accessToken') -- instant token theft.
// Why NOT React state: if the component holding the state unmounts (route change),
//   the token disappears. The next API call fails with 401.
// Why NOT a cookie: a cookie with the access token would require CSRF protection.
//   Keeping it in memory avoids that entire problem class.
// Why module variable works: it persists as long as the browser tab is open,
//   survives React re-renders and route changes, but is cleared on tab close.
let accessToken = "";

export const setAccessToken = (token) => {
  accessToken = token;
};

api.interceptors.request.use(
  (config) => {
    const isAuthRequest = 
      config.url?.includes('/auth/login/') ||
      config.url?.includes('/auth/login/verify/') ||
      config.url?.includes('/auth/salt/') ||
      config.url?.includes('/auth/password-reset/') ||
      config.url?.includes('/auth/logout/');

    if (accessToken && !isAuthRequest) {
      // The server reads this header: "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5..."
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================================
// RESPONSE INTERCEPTOR: Silently refresh on 401
// ============================================================
api.interceptors.response.use(
  // If the response is successful (2xx), just pass it through
  (response) => response,

  // If the response is an error, check if it is a 401 (Unauthorized)
  async (error) => {
    const originalRequest = error.config;

    // Check if the failed request was the refresh endpoint itself.
    // If refresh fails with 401, we must NOT retry -- that creates an infinite loop.
    const isRefreshEndpoint = originalRequest.url?.includes('/auth/refresh/');

    // Do not attempt to refresh on authentication-related endpoints (like login, verify, salt, etc.)
    const isAuthRequest = 
      originalRequest.url?.includes('/auth/login/') ||
      originalRequest.url?.includes('/auth/login/verify/') ||
      originalRequest.url?.includes('/auth/salt/') ||
      originalRequest.url?.includes('/auth/password-reset/') ||
      originalRequest.url?.includes('/auth/logout/');

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&  // _retry flag prevents retrying the same request twice
      !isRefreshEndpoint &&       // Never retry the refresh endpoint
      !isAuthRequest              // Never attempt to silent-refresh on auth endpoints
    ) {
      originalRequest._retry = true; // Mark this request as "already retried"

      try {
        // Attempt to get a new access token using the HttpOnly refresh token cookie.
        // withCredentials: true tells the browser to send the cookie.
        // The refresh token is in the cookie -- we do not need to send it explicitly.
        const res = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/refresh/`,
          {},
          { withCredentials: true }
        );

        // Store the new access token in memory
        accessToken = res.data.access;

        // Retry the original failed request with the new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest); // Re-run the original request

      } catch (refreshError) {
        // Refresh also failed -- the refresh token is expired or blacklisted.
        // Clear the stale access token and redirect to login.
        accessToken = "";
        // The ?session=expired query param lets the login page show a message
        window.location.href = "/login?session=expired";
        return Promise.reject(refreshError);
      }
    }

    // For all other errors (400, 403, 404, 500...), just reject normally
    return Promise.reject(error);
  }
);

export { api };
