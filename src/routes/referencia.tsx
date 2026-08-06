import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { SchemaExplorer } from "@/components/SchemaExplorer";

export const Route = createFileRoute("/referencia")({
  head: () => ({
    meta: [
      { title: "Referência do schema | SQL para quem vende" },
      {
        name: "description",
        content:
          "Tabelas e colunas da base de treino de CRM: deals, companies, owners, contacts, stages, activities e histórico de etapas.",
      },
      { property: "og:title", content: "Referência do schema | SQL para quem vende" },
      {
        property: "og:description",
        content: "Explore as tabelas e colunas da base de treino usada no curso.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <h1 className="mb-3 font-mono text-lg font-semibold">Referência do schema</h1>
      <SchemaExplorer />
    </AppShell>
  ),
});
