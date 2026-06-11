import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-dvh bg-background px-5 py-10 text-foreground">
      <section className="mx-auto max-w-4xl space-y-8">
        <div>
          <p className="text-sm text-primary">Video Flow</p>
          <h1 className="font-display text-4xl font-bold">Politica de Privacidade</h1>
          <p className="mt-3 text-muted-foreground">Documento placeholder para operacao inicial. Validacao LGPD/juridica final deve ocorrer antes de comercializacao publica.</p>
        </div>
        {[
          ["Dados coletados", "Podemos armazenar perfil, workspace, configuracoes, conteudos, arquivos, logs de auditoria, eventos de seguranca e solicitacoes de suporte."],
          ["Uso dos dados", "Os dados sao usados para operar o SaaS, controlar permissoes, processar jobs, calcular creditos, melhorar seguranca e gerar relatorios internos."],
          ["Compartilhamento", "Providers externos somente devem receber dados quando configurados e necessarios para executar geracoes ou processamento solicitado."],
          ["Seguranca", "O sistema usa RLS, segregacao por workspace, logs, rate limits e chaves server-side para reduzir exposicao indevida."],
          ["Direitos LGPD", "Usuarios podem solicitar exportacao, download de dados pessoais ou exclusao. A exclusao definitiva pode exigir revisao manual nesta fase."],
          ["Retencao", "Arquivos temporarios, jobs falhos, logs antigos e assets excluidos seguem politicas de retencao configuraveis por workspace."]
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
