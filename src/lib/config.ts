export const DEFAULT_API_URL = "https://api.ccapglobal.com/api/v1";

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim() ?? "";
export const API_URL = rawApiUrl || DEFAULT_API_URL;

if (rawApiUrl) {
	console.log(
		"[config] NEXT_PUBLIC_API_URL loaded:",
		rawApiUrl,
		"=> using API_URL:",
		API_URL,
	);
} else {
	console.warn(
		"[config] NEXT_PUBLIC_API_URL is not set. Falling back to default API URL:",
		API_URL,
	);
}
