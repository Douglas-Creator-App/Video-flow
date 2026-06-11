import type { PermissionAction, RoleName } from "@/lib/types";

export const rolePermissions: Record<RoleName, PermissionAction[]> = {
  Owner: [
    "workspace.manage",
    "users.invite",
    "users.remove",
    "roles.manage",
    "projects.create",
    "projects.update",
    "content.create",
    "content.publish",
    "content.organize",
    "library.manage",
    "keywords.manage",
    "personas.manage",
    "ai.generate",
    "ai.manage",
    "media.generate",
    "media.manage",
    "billing.manage",
    "audit.read"
  ],
  Admin: [
    "workspace.manage",
    "users.invite",
    "users.remove",
    "projects.create",
    "projects.update",
    "content.create",
    "content.publish",
    "content.organize",
    "library.manage",
    "keywords.manage",
    "personas.manage",
    "ai.generate",
    "ai.manage",
    "media.generate",
    "media.manage",
    "audit.read"
  ],
  Manager: [
    "users.invite",
    "projects.create",
    "projects.update",
    "content.create",
    "content.publish",
    "content.organize",
    "keywords.manage",
    "personas.manage",
    "ai.generate",
    "media.generate",
    "audit.read"
  ],
  Editor: ["projects.update", "content.create", "content.organize", "library.manage", "keywords.manage", "personas.manage", "ai.generate", "media.generate"],
  Viewer: ["audit.read"]
};

export function can(role: RoleName, permission: PermissionAction) {
  return rolePermissions[role].includes(permission);
}
