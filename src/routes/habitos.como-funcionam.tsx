import { createFileRoute, Link } from "@tanstack/react-router";
import { Flame, CalendarCheck, Percent, Repeat } from "lucide-react";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/habitos/como-funcionam")({
  head: () => ({
    meta: [
      { title: "Como funcionam os hábitos — Rotina" },
      {
        name: "description",
        content: "Entenda sequências, taxa de consistência e frequência dos hábitos no Rotina.",
      },
      { property: "og:title", content: "Como funcionam os hábitos — Rotina" },
      { property: "og:description", content: "Sequência, consistência e frequência explicadas." },
    ],
  }),
  component: HowHabitsWork,
});

const BLOCKS = [
  {
    icon: CalendarCheck,
    title: "Marcação diária",
    text: "Cada quadradinho do mês representa um dia. Toque para marcar ou desmarcar o hábito naquele dia — o histórico fica salvo no seu dispositivo.",
  },
  {
    icon: Flame,
    title: "Sequência atual",
    text: "É a quantidade de dias seguidos com o hábito marcado, contando de hoje (ou de ontem, se você ainda não marcou hoje) para trás. Um dia em branco zera a sequência.",
  },
  {
    icon: Percent,
    title: "Consistência (30 dias)",
    text: "Percentual de dias marcados nos últimos 30 dias. É a melhor métrica de longo prazo: falhar um dia não estraga o mês.",
  },
  {
    icon: Repeat,
    title: "Frequência",
    text: "Hábitos podem ser diários, em dias específicos da semana ou algumas vezes por semana. Na tela Hoje aparecem apenas os hábitos previstos para o dia.",
  },
];

function HowHabitsWork() {
  return (
    <AppShell title="Como funcionam meus hábitos" subtitle="Sequências, consistência e frequência">
      <div className="grid gap-4 md:grid-cols-2">
        {BLOCKS.map((b) => (
          <article key={b.title} className="card-surface space-y-2 p-5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/15 text-primary">
              <b.icon className="h-4 w-4" />
            </span>
            <h2 className="text-sm font-semibold">{b.title}</h2>
            <p className="text-sm text-muted-foreground">{b.text}</p>
          </article>
        ))}
      </div>

      <div className="card-surface space-y-2 p-5">
        <h2 className="text-sm font-semibold">Dica prática</h2>
        <p className="text-sm text-muted-foreground">
          Comece com poucos hábitos e metas pequenas o suficiente para caber num dia ruim. Depois de
          duas semanas consistentes, aumente a meta.
        </p>
        <Link to="/habitos" className="inline-block text-xs font-medium text-primary hover:underline">
          Voltar para meus hábitos
        </Link>
      </div>
    </AppShell>
  );
}