import { NextResponse, type NextRequest } from "next/server";
import { AuthError, recordAuthAudit, requireAuth } from "@/lib/auth";
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";

const ROLE_DEFINITIONS: Array<{ name: string; description: string; allPermissions?: boolean; permissions?: string[] }> = [
  { name: "Owner", description: "Dono do workspace com acesso total.", allPermissions: true },
  { name: "Admin", description: "Administra usuarios, conteudo e configuracoes.", allPermissions: true },
  {
    name: "Manager",
    description: "Gerencia producao de conteudo e midias.",
    permissions: [
      "projects.create", "projects.update", "content.create", "content.publish", "content.organize",
      "library.manage", "keywords.manage", "personas.manage", "ai.generate", "media.generate",
      "export_video", "download_package", "mark_as_published", "edit_metadata", "upload_asset",
      "edit_asset", "favorite_asset", "create_collection", "import_external_asset",
      "view_templates", "create_template", "edit_template", "use_template", "audit.read"
    ]
  },
  {
    name: "Editor",
    description: "Cria e edita conteudo e midias.",
    permissions: [
      "projects.update", "content.create", "content.organize", "ai.generate", "media.generate",
      "upload_asset", "edit_asset", "favorite_asset", "view_templates", "create_template", "use_template"
    ]
  },
  { name: "Viewer", description: "Acesso somente leitura.", permissions: ["view_templates"] }
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "workspace";
}

export async function POST(request: NextRequest) {
  try {
    const { user } = await requireAuth();
    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json({ status: "failed", error: "Supabase admin nao configurado." }, { status: 503 });
    }
    const body = await request.json().catch(() => ({}));
    const name = String(body.name ?? "").trim().slice(0, 80) || "Meu Workspace";
    const admin = createAdminClient();

    // Garante o perfil do usuario antes do workspace.
    const fullName = (user.user_metadata?.full_name as string | undefined) ?? user.email ?? null;
    await admin.from("user_profiles").upsert({ id: user.id, full_name: fullName }, { onConflict: "id" });

    const baseSlug = slugify(name);
    const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 7)}`;

    const { data: workspace, error: workspaceError } = await admin
      .from("workspaces")
      .insert({ name, slug, plan: "Basic", owner_id: user.id })
      .select("id, name, slug, plan, owner_id")
      .single();
    if (workspaceError || !workspace) {
      throw new Error(`Falha ao criar workspace: ${workspaceError?.message ?? "desconhecida"}`);
    }

    try {
      const { data: permissionRows, error: permissionsError } = await admin.from("permissions").select("id, key");
      if (permissionsError) throw new Error(`Falha ao carregar permissions: ${permissionsError.message}`);
      const permissionByKey = new Map((permissionRows ?? []).map((row) => [row.key as string, row.id as string]));

      const { data: roles, error: rolesError } = await admin
        .from("roles")
        .insert(ROLE_DEFINITIONS.map((role) => ({
          workspace_id: workspace.id,
          name: role.name,
          description: role.description,
          is_system: true
        })))
        .select("id, name");
      if (rolesError || !roles?.length) throw new Error(`Falha ao criar roles: ${rolesError?.message ?? "desconhecida"}`);

      const rolePermissionRows: Array<{ role_id: string; permission_id: string }> = [];
      for (const role of roles) {
        const definition = ROLE_DEFINITIONS.find((item) => item.name === role.name);
        const keys = definition?.allPermissions
          ? Array.from(permissionByKey.keys())
          : definition?.permissions ?? [];
        for (const key of keys) {
          const permissionId = permissionByKey.get(key);
          if (permissionId) rolePermissionRows.push({ role_id: role.id, permission_id: permissionId });
        }
      }
      if (rolePermissionRows.length) {
        const { error: rolePermissionsError } = await admin.from("role_permissions").insert(rolePermissionRows);
        if (rolePermissionsError) throw new Error(`Falha ao vincular permissions: ${rolePermissionsError.message}`);
      }

      const ownerRole = roles.find((role) => role.name === "Owner");
      if (!ownerRole) throw new Error("Role Owner nao foi criada.");
      const { error: membershipError } = await admin.from("workspace_users").insert({
        workspace_id: workspace.id,
        user_id: user.id,
        role_id: ownerRole.id,
        status: "active"
      });
      if (membershipError) throw new Error(`Falha ao registrar membership: ${membershipError.message}`);

      // Carteira de creditos e assinatura trial sao criadas por trigger no banco
      // (bootstrap de billing do workspace) no insert do workspace.
    } catch (setupError) {
      // Bootstrap incompleto: remove o workspace (cascade limpa roles, membership e wallet).
      await admin.from("workspaces").delete().eq("id", workspace.id);
      throw setupError;
    }

    await recordAuthAudit("create", {
      workspaceId: workspace.id,
      entityType: "workspace",
      entityId: workspace.id,
      metadata: { name: workspace.name, slug: workspace.slug, bootstrap: true }
    });

    return NextResponse.json({
      status: "completed",
      workspace: { id: workspace.id, name: workspace.name, slug: workspace.slug, plan: workspace.plan }
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ status: "failed", error: error.message }, { status: error.status });
    }
    return NextResponse.json({
      status: "failed",
      error: error instanceof Error ? error.message : "Falha ao criar workspace."
    }, { status: 500 });
  }
}
