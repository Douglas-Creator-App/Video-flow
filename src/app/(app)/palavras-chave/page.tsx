import { KeywordLibrary } from "@/components/content/keyword-library";
import { ModuleHeader } from "@/components/module-header";

export default function PalavrasChavePage() {
  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="Palavras-chave"
        title="Biblioteca de palavras-chave"
        description="Filtre por nicho, projeto e categoria para planejar conteúdo com base em intenção e dificuldade."
      />
      <KeywordLibrary />
    </div>
  );
}
