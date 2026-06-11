import type { SupabaseClient } from "@supabase/supabase-js";
import type { ContentItem, Keyword, Niche, Persona, Project } from "@/lib/types";

export function createContentRepository(supabase: SupabaseClient) {
  return {
    listProjects(workspaceId: string) {
      return supabase.from("projects").select("*").eq("workspace_id", workspaceId).order("updated_at", { ascending: false });
    },
    createProject(project: Omit<Project, "id" | "createdAt" | "updatedAt">) {
      return supabase.from("projects").insert({
        workspace_id: project.workspaceId,
        name: project.name,
        description: project.description,
        main_niche: project.mainNiche,
        logo: project.logo,
        primary_color: project.primaryColor,
        language: project.language,
        country: project.country,
        status: project.status
      });
    },
    archiveProject(id: string) {
      return supabase.from("projects").update({ status: "arquivado" }).eq("id", id);
    },
    listNiches(workspaceId: string) {
      return supabase.from("niches").select("*").or(`workspace_id.is.null,workspace_id.eq.${workspaceId}`).eq("active", true);
    },
    upsertNiche(niche: Pick<Niche, "workspaceId" | "name" | "active">) {
      return supabase.from("niches").insert({
        workspace_id: niche.workspaceId,
        name: niche.name,
        active: niche.active,
        is_default: false
      });
    },
    listPersonas(projectId: string) {
      return supabase.from("personas").select("*").eq("project_id", projectId).order("updated_at", { ascending: false });
    },
    createPersona(persona: Omit<Persona, "id">) {
      return supabase.from("personas").insert({
        workspace_id: persona.workspaceId,
        project_id: persona.projectId,
        name: persona.name,
        age: persona.age,
        gender: persona.gender,
        profession: persona.profession,
        pains: persona.pains,
        goals: persona.goals,
        objections: persona.objections,
        desires: persona.desires,
        interests: persona.interests
      });
    },
    listKeywords(workspaceId: string) {
      return supabase.from("keywords").select("*").eq("workspace_id", workspaceId).order("volume", { ascending: false });
    },
    createKeyword(keyword: Omit<Keyword, "id">) {
      return supabase.from("keywords").insert({
        workspace_id: keyword.workspaceId,
        project_id: keyword.projectId,
        niche_id: keyword.nicheId,
        word: keyword.word,
        volume: keyword.volume,
        difficulty: keyword.difficulty,
        intent: keyword.intent,
        category: keyword.category
      });
    },
    listContent(workspaceId: string) {
      return supabase.from("content_items").select("*, content_item_tags(tags(*))").eq("workspace_id", workspaceId);
    },
    createContent(item: Omit<ContentItem, "id" | "tags" | "createdAt">) {
      return supabase.from("content_items").insert({
        workspace_id: item.workspaceId,
        project_id: item.projectId,
        folder_id: item.folderId,
        type: item.type,
        title: item.title,
        description: item.description,
        category: item.category,
        status: item.status,
        author_name: item.author
      });
    }
  };
}
