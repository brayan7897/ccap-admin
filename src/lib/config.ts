export const DEFAULT_API_URL = "https://api.ccapglobal.com/api/v1";

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim() ?? "";
export const API_URL = rawApiUrl || DEFAULT_API_URL;


