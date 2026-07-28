import "server-only";

const apiBaseUrl = process.env.API_BASE_URL;

if (!apiBaseUrl) {
  throw new Error("API_BASE_URL is not set");
}

export const env = {
  apiBaseUrl: apiBaseUrl.replace(/\/$/, ""),
};
