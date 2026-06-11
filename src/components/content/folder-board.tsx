import { Archive, Copy, Folder, FolderInput } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { contentItems, folders, projects } from "@/lib/mock-data";

export function FolderBoard() {
  return (
    <div className="space-y-6">
      {projects.map((project) => (
        <section key={project.id} className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">{project.name}</h2>
              <p className="text-sm text-muted-foreground">Estrutura padrão de organização do projeto.</p>
            </div>
            <Badge>{project.mainNiche}</Badge>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {folders.filter((folder) => folder.projectId === project.id).map((folder) => {
              const count = contentItems.filter((item) => item.folderId === folder.id).length;
              return (
                <Card key={folder.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <Folder className="h-4 w-4 text-primary" />
                      {folder.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{count} itens nesta pasta</p>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" className="gap-2">
                        <FolderInput className="h-4 w-4" />
                        Mover
                      </Button>
                      <Button size="sm" variant="outline" className="gap-2">
                        <Copy className="h-4 w-4" />
                        Copiar
                      </Button>
                      <Button size="sm" variant="outline" className="gap-2">
                        <Archive className="h-4 w-4" />
                        Arquivar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
