import { GlobalSearch } from "@/components/content/global-search";
import { ModuleHeader } from "@/components/module-header";

export default function BuscaPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="Busca global"
        title="Busca com filtros avançados"
        description="Pesquise em projetos, conteúdos, personas, tags e palavras-chave a partir de uma única experiência."
      />
      <GlobalSearch />
    </div>
  );
}
