const rawApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

if (!rawApiUrl && process.env.NODE_ENV === "production") {
  throw new Error(
    "[ccap-admin] NEXT_PUBLIC_API_URL is required in production. " +
    "Set it in your environment variables or .env.local file."
  );
}

// In development, fall back to localhost if env is not set
export const API_URL = rawApiUrl ?? "http://localhost:8000/api/v1";

