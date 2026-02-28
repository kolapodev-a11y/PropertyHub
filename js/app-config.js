// Central place for frontend environment configuration.
// If you deploy backend under same domain, set API_BASE = "".

export const API_BASE =
  (location.hostname === "localhost" || location.hostname === "127.0.0.1")
    ? "http://localhost:5001"
    : "";
