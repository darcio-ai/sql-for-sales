import data from "@/data/licoes.json";

export type Licao = {
  id: string;
  bloco: number;
  bloco_nome: string;
  titulo: string;
  pergunta_negocio: string;
  duracao_min: number;
  conceito: string;
  sintaxe: { codigo: string; explicacao: string };
  inversao?: { titulo: string; texto: string };
  variacao: { codigo: string; explicacao: string };
  erro_classico: { codigo: string; mensagem: string; explicacao: string };
  exercicio: {
    enunciado: string;
    dica: string;
    gabarito: string;
    resultado_esperado?: string;
  };
  pratica_extra?: { enunciado: string; gabarito: string }[];
};

export const LICOES = data as unknown as Licao[];

export function getLicao(id: string): Licao | undefined {
  return LICOES.find((l) => l.id === id);
}

export function blocos(): { bloco: number; nome: string; licoes: Licao[] }[] {
  const map = new Map<number, { bloco: number; nome: string; licoes: Licao[] }>();
  for (const l of LICOES) {
    if (!map.has(l.bloco)) map.set(l.bloco, { bloco: l.bloco, nome: l.bloco_nome, licoes: [] });
    map.get(l.bloco)!.licoes.push(l);
  }
  return [...map.values()].sort((a, b) => a.bloco - b.bloco);
}
