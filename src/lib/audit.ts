export async function registerAuditLog(input: {
  action: "login" | "logout" | "create" | "delete" | "update";
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}) {
  if (typeof window !== "undefined") {
    await fetch("/api/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input)
    });
    return;
  }
  const { persistAuditLogWithSession } = await import("@/lib/audit-server");
  await persistAuditLogWithSession(input);
}
