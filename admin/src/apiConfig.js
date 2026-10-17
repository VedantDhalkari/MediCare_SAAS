// Central API configuration for MediCare Admin
export function getApiBase() {
  const envUrl = import.meta.env.VITE_API_URL;
  if (typeof envUrl === "string" && envUrl.trim() !== "") {
    return envUrl.trim().replace(/\/+$/, "");
  }
  // When running locally in Vite dev mode on port 5173 or 5174, point to localhost:5000
  if (
    typeof window !== "undefined" &&
    (window.location.port === "5173" || window.location.port === "5174")
  ) {
    return "http://localhost:5000";
  }
  // In production (Docker / Nginx on EC2), use relative URL so requests route via current host & port
  return "";
}

export const API_BASE = getApiBase();
export default API_BASE;
