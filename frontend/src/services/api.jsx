const API_BASE = "https://cinevobackend.vercel.app/api/v1";



async function request(path, { method = "GET", body, token, signal, headers = {} } = {}) {
  const url = API_BASE + path;
  const opts = { method, headers: { ...headers }, signal };

  // send cookies (for httpOnly tokens)
  opts.credentials = "include";

  // send Bearer token if present (header-token flow)
  const t = token ?? localStorage.getItem("accessToken");
  if (t) opts.headers["Authorization"] = `Bearer ${t}`;

  if (body && !(body instanceof FormData)) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  } else if (body instanceof FormData) {
    // Let the browser set multipart boundary automatically
    opts.body = body;
  }

  const res = await fetch(url, opts);
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }

  if (!res.ok) {
    // Handle 401 Unauthorized - Attempt to refresh token
    if (res.status === 401 && !opts._retry && !url.includes("/refresh-token")) {
      console.log("🔒 401 detected, attempting token refresh...");
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        const refreshRes = await fetch(API_BASE + "/users/refresh-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ refreshToken }), // Send token in body as fallback
        });

        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          const newAccessToken = refreshData?.data?.accessToken;
          const newRefreshToken = refreshData?.data?.refreshToken;

          console.log("✅ Token refresh successful");

          if (newAccessToken) {
            localStorage.setItem("accessToken", newAccessToken);
            if (newRefreshToken) localStorage.setItem("refreshToken", newRefreshToken);
            
            // Retry original request with new token
            return request(path, { ...opts, token: newAccessToken, _retry: true });
          }
        } else {
          console.error("❌ Token refresh failed:", refreshRes.status);
          // Clear tokens if refresh fails to prevent infinite loops/stale state
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          window.location.href = "/login"; // Force redirect to login
        }
      } catch (refreshError) {
        console.error("❌ Token refresh error:", refreshError);
      }
    }

    const err = new Error(data?.message || `Request failed: ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export default {
  get: (p, opts) => request(p, { ...opts, method: "GET" }),
  post: (p, body, opts) => request(p, { ...opts, method: "POST", body }),
  patch: (p, body, opts) => request(p, { ...opts, method: "PATCH", body }),
  put: (p, body, opts) => request(p, { ...opts, method: "PUT", body }),
  del: (p, opts) => request(p, { ...opts, method: "DELETE" }),
};
