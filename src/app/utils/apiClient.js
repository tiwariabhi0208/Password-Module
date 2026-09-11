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
  scheduleProactiveRefresh(token);
};

// ============================================================
// PROACTIVE REFRESH
// ============================================================
// Waiting for a request to fail with a 401 before refreshing works, but it
// means every action taken right after the access token expires pays for an
// extra failed request + refresh round trip before it can proceed. Instead,
// read the token's own "exp" claim and schedule a silent refresh a little
// before it actually expires, so a valid token is normally already in hand.
// This is purely an optimization -- the 401 handling above still catches it
// if this timer is ever missed (e.g. tab was asleep) or the refresh fails.
let refreshTimer = null;
const REFRESH_SKEW_MS = 60 * 1000; // refresh 60s before expiry

const decodeJwtExpMs = (token) => {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const { exp } = JSON.parse(json);
    return exp ? exp * 1000 : null;
  } catch {
    return null;
  }
};

const scheduleProactiveRefresh = (token) => {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
  if (!token) return;

  const expMs = decodeJwtExpMs(token);
  if (!expMs) return;

  const delay = expMs - Date.now() - REFRESH_SKEW_MS;
  if (delay <= 0) return; // already expired/about to -- let the 401 path handle it

  refreshTimer = setTimeout(() => {
    // Best-effort: if this fails (e.g. user is offline or already logged out),
    // the next real request's 401 handler will deal with it as before.
    refreshAccessToken().catch(() => {});
  }, delay);
};

// ============================================================
// REFRESH MUTEX
// ============================================================
// The backend rotates refresh tokens on every use and blacklists the old one
// (see SIMPLE_JWT ROTATE_REFRESH_TOKENS / BLACKLIST_AFTER_ROTATION).
// If two requests both get a 401 around the same time (e.g. the access token
// expires while multiple calls are in flight), each would otherwise fire its
// own POST /auth/refresh/ using the same refresh-token cookie. The first one
// to land rotates the cookie and blacklists the old refresh token; the second
// then gets rejected with that now-blacklisted token and forces a logout --
// even though the session was perfectly valid a moment earlier.
//
// To fix this, only one refresh request is ever in flight at a time. Any 401
// that arrives while a refresh is already running just awaits that same
// promise instead of starting a competing one.
let refreshPromise = null;

const refreshAccessToken = () => {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(
        `${import.meta.env.VITE_API_BASE_URL}/auth/refresh/`,
        {},
        { withCredentials: true }
      )
      .then((res) => {
        accessToken = res.data.access;
        scheduleProactiveRefresh(accessToken); // keep the cycle going for the new token
        return accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
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
        // Get a new access token using the HttpOnly refresh token cookie.
        // If a refresh is already in flight (another request also hit a 401),
        // this awaits that same call instead of starting a second, competing one.
        const newAccessToken = await refreshAccessToken();

        // Retry the original failed request with the new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest); // Re-run the original request

      } catch (refreshError) {
        // Refresh also failed -- the refresh token is expired or blacklisted.
        // Clear the stale access token and redirect to login.
        accessToken = "";
        scheduleProactiveRefresh(null); // cancel any pending proactive-refresh timer
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
