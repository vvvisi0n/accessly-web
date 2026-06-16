export type UserRole = "free" | "pro" | "enterprise" | "admin";

export const accessRules: Record<string, UserRole[]> = {
  // Dashboard access by role
  "/dashboard/pro": ["pro", "enterprise", "admin"],
  "/dashboard/enterprise": ["enterprise", "admin"],
  "/dashboard/health": ["pro", "enterprise", "admin"],
  "/dashboard/travel": ["free", "pro", "enterprise", "admin"],
  "/dashboard/living": ["free", "pro", "enterprise", "admin"],
  "/dashboard/government": ["enterprise", "admin"],
  "/dashboard/foundation": ["admin"],
};
