import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-dvh bg-background px-5 py-10 text-foreground">
      <section className="mx-auto max-w-4xl space-y-8">
        <div>
          <p className="text-sm text-primary">Video Flow</p>
          <h1 className="font-display text-4xl font-bold">Termos de Uso</h1>
          <p className="mt-3 text-muted-foreground">Versao placeholder profissional para uso interno. Revisao juridica final recomendada antes de venda publica.</p>
        </div>
        {[
          ["Uso da plataforma", "O Video Flow oferece ferramentas para organizar, gerar, revisar, renderizar e exportar conteudos. O usuario e responsavel por validar direitos, qualidade e adequacao do conteudo antes de publicar."],
          ["Conta e seguranca", "O usuario deve proteger credenciais, limitar acessos por workspace e manter informacoes corretas. Acoes administrativas podem ser registradas em logs de auditoria."],
          ["Conteudo e direitos", "Materiais enviados, gerados ou importados devem respeitar direitos autorais, marcas, privacidade e leis aplicaveis."],
          ["Providers e creditos", "Recursos de IA, voz, imagem, video, render e storage podem consumir creditos. Em modo demo, consumos podem ser simulados."],
          ["Limitacoes", "A plataforma pode apresentar resultados mockados ou experimentais em fases de desenvolvimento. Publicacao automatica nao e habilitada sem confirmacao."],
          ["Atualizacoes", "Estes termos podem ser atualizados conforme o produto evolui. Mudancas relevantes devem exigir novo aceite."]
        ].map(([title, body]) => (
          <article key={title} className="rounded-md border border-white/5 bg-secondary/40 p-5">
            <h2 className="font-display text-xl font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
          </article>
        ))}
        <Link href="/auth/login" className="text-sm text-primary">Voltar para login</Link>
      </section>
    </main>
  );
}
