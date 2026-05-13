import { adminClient, organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

// import { ac, admin, user } from "@/server/lib/Auth";

const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const authClient = createAuthClient({
  // baseURL: apiUrl,
  basePath: "/api/auth",
});
