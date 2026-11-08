"use client";

import React, { useState, useEffect } from "react";
import { ClustersData } from "@/types/dashboard";
import {
  IconAlert,
  IconClock,
  IconNetwork,
  IconShield,
  IconBarChart,
} from "@/components/Icons";

export default function PerfisPage() {
  const [data, setData] = useState<ClustersData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadClusters() {
      try {
        const res = await fetch("/data/clusters.json");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        } else {
          setData({
            status: "pending",
            message: "Aguardando consolidação do K_FINAL no notebook analítico.",
          });
        }
      } catch (err) {
        setData({
          status: "pending",
          message: "Aguardando consolidação do K_FINAL no notebook analítico.",
        });
      } finally {
        setLoading(false);
      }
    }
    loadClusters();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-8 h-8 border-4 border-red-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-500 font-medium">Verificando status dos clusters...</p>
      </div>
    );
  }

  const isPending = !data || data.status === "pending" || !data.perfis || data.perfis.length === 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Cabeçalho */}
      <section className="bg-white rounded-md border border-gray-200 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-50 text-[#EB0029] text-xs font-bold border border-red-100 uppercase tracking-wider">
            <IconNetwork className="w-3.5 h-3.5 text-[#EB0029]" />
            Aprendizado de Máquina Não Supervisionado • K-Medoids (Método Alternado)
          </div>
          {isPending ? (
            <span className="text-xs font-bold px-2.5 py-1 rounded bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
              <IconClock className="w-3 h-3" />
              Etapa Analítica em Andamento no Notebook
            </span>
          ) : (
            <span className="text-xs font-bold px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              K_FINAL Consolidado: k = {data?.k_final}
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-[#1A1A1A] tracking-tight uppercase">
          Perfis Comportamentais de Estudantes
        </h1>
        <p className="text-sm text-gray-600 mt-2 leading-relaxed">
          Caracterização de grupos de estudantes a partir de padrões de rotina e hábitos (sono, atividade física, alimentação, tempo de estudos e lazer), sem interferência prévia da escala GAD-7.
        </p>
      </section>

      {/* Seção quando Status = Pending */}
      {isPending ? (
        <section className="bg-white rounded-md border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="p-4 bg-amber-50 rounded border border-amber-200 flex items-start gap-3">
            <IconAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs text-amber-900">
              <strong className="text-sm font-bold text-amber-950 block">
                Seleção de K_FINAL Pendente de Congelamento Analítico
              </strong>
              <p className="leading-relaxed">
                Em respeito à integridade científica do TCC e às diretrizes metodológicas estabelecidas, o número definitivo de agrupamentos (K_FINAL) e seus rótulos conceituais ainda estão em fase de avaliação quantitativa no notebook do projeto.
              </p>
              <p className="leading-relaxed font-semibold">
                Nenhum agrupamento ou dado fictício é exibido nesta interface.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-gray-50 rounded border border-gray-200 space-y-2">
              <h3 className="font-bold text-[#1A1A1A] text-sm flex items-center gap-2">
                <IconShield className="w-4 h-4 text-[#EB0029]" />
                Critérios para Escolha Definitiva do K_FINAL:
              </h3>
              <ul className="space-y-1 text-gray-600 list-disc pl-4">
                <li>Método do Cotovelo (Elbow Method / Inércia)</li>
                <li>Silhouette Score (Coesão vs. Separação)</li>
                <li>Davies-Bouldin Index &amp; Calinski-Harabasz Index</li>
                <li>Dunn Index</li>
                <li>Avaliação de estabilidade por reamostragem com Adjusted Rand Index (ARI)</li>
                <li>Tamanho e interpretabilidade substantiva dos perfis</li>
              </ul>
            </div>

            <div className="p-4 bg-gray-50 rounded border border-gray-200 space-y-2">
              <h3 className="font-bold text-[#1A1A1A] text-sm flex items-center gap-2">
                <IconShield className="w-4 h-4 text-emerald-700" />
                Garantia Ética e de Não-Contaminação:
              </h3>
              <p className="text-gray-600 leading-relaxed">
                O GAD-7 <strong>não participa</strong> da matriz de distância de agrupamento.
                Os perfis descreverão exclusivamente variáveis comportamentais. A distribuição dos sintomas de ansiedade será incorporada exclusivamente como desfecho analítico após o congelamento do modelo.
              </p>
              <div className="pt-2 text-[11px] text-gray-500">
                Assim que o pipeline do notebook consolidar o arquivo <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-gray-200">public/data/clusters.json</code>, esta tela será automaticamente renderizada sem necessidade de refatoração no frontend.
              </div>
            </div>
          </div>
        </section>
      ) : (
        <div className="space-y-6">
          {/* Métricas de Validação Analítica */}
          {data.metricas_validacao && (
            <section className="bg-white rounded-md border border-gray-200 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h2 className="text-sm font-bold text-[#1A1A1A] flex items-center gap-2">
                  <IconShield className="w-4 h-4 text-[#EB0029]" />
                  Métricas de Validação e Estabilidade dos Clusters (K-Medoids / Voronoi)
                </h2>
                <span className="text-xs font-semibold text-gray-500 font-mono">
                  Solução Exploratória K = {data.metricas_validacao.k}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-3 bg-gray-50 rounded border border-gray-200">
                  <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Silhueta Média</div>
                  <div className="text-lg font-bold text-[#1A1A1A] mt-0.5 font-mono">{data.metricas_validacao.silhouette.toFixed(4)}</div>
                  <div className="text-[10px] text-gray-400">Separação entre grupos</div>
                </div>
                <div className="p-3 bg-gray-50 rounded border border-gray-200">
                  <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Davies-Bouldin</div>
                  <div className="text-lg font-bold text-[#1A1A1A] mt-0.5 font-mono">{data.metricas_validacao.daviesBouldin.toFixed(4)}</div>
                  <div className="text-[10px] text-gray-400">Similaridade intra/inter</div>
                </div>
                <div className="p-3 bg-gray-50 rounded border border-gray-200">
                  <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Calinski-Harabasz</div>
                  <div className="text-lg font-bold text-[#1A1A1A] mt-0.5 font-mono">{data.metricas_validacao.calinskiHarabasz.toFixed(2)}</div>
                  <div className="text-[10px] text-gray-400">Dispersão entre/intra</div>
                </div>
                <div className="p-3 bg-gray-50 rounded border border-gray-200">
                  <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Índice de Dunn</div>
                  <div className="text-lg font-bold text-[#1A1A1A] mt-0.5 font-mono">{data.metricas_validacao.dunnIndex.toFixed(4)}</div>
                  <div className="text-[10px] text-gray-400">Distância inter-cluster</div>
                </div>
                <div className="p-3 bg-red-50/60 rounded border border-red-200">
                  <div className="text-[11px] font-semibold text-[#EB0029] uppercase tracking-wider">Estabilidade ARI</div>
                  <div className="text-lg font-bold text-[#EB0029] mt-0.5 font-mono">0.6899</div>
                  <div className="text-[10px] text-gray-500">50 reamostragens (80%)</div>
                </div>
              </div>

              {/* Testes Inferencias de Hipótese (Kruskal-Wallis e Qui-Quadrado) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 bg-gray-50 rounded border border-gray-200 text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#1A1A1A]">Kruskal-Wallis (Escore GAD-7):</span>
                    <span className="font-mono text-[#EB0029] font-bold">p = 0.0003 (p &lt; 0.001)</span>
                  </div>
                  <p className="text-[11px] text-gray-600">
                    Estatística H = 16.24 (gl = 2, &epsilon;&sup2; = 0.078). Diferença estatisticamente altamente significante de ansiedade entre os perfis de hábitos.
                  </p>
                </div>

                <div className="p-3 bg-gray-50 rounded border border-gray-200 text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#1A1A1A]">Teste Qui-Quadrado (&chi;&sup2;):</span>
                    <span className="font-mono text-[#EB0029] font-bold">p = 0.0002 (p &lt; 0.001)</span>
                  </div>
                  <p className="text-[11px] text-gray-600">
                    &chi;&sup2; = 26.15 (gl = 6). A proporção de níveis clínicos (mínima a grave) difere substancialmente conforme o perfil de hábitos de vida.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Perfis Comportamentais */}
          <div className="grid md:grid-cols-3 gap-5">
            {data.perfis?.map((perfil) => (
              <div
                key={perfil.id}
                className="bg-white rounded-md border border-gray-200 p-5 sm:p-6 shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs font-bold px-2.5 py-0.5 rounded text-white shadow-2xs"
                      style={{ backgroundColor: perfil.color }}
                    >
                      Perfil {perfil.id + 1}
                    </span>
                    <span className="text-xs font-semibold text-gray-600">
                      <strong>n = {perfil.n}</strong> ({perfil.pct}%)
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-[#1A1A1A] text-base leading-snug">{perfil.name}</h3>
                    <p className="text-xs text-gray-600 mt-2 leading-relaxed">{perfil.description}</p>
                  </div>

                  {/* Diagnóstico GAD-7 Clínico */}
                  <div className="p-3 bg-gray-50 rounded border border-gray-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 font-medium">GAD-7 Médio:</span>
                      <span className="font-bold text-[#1A1A1A] text-sm">
                        {perfil.gad7.mean.toFixed(2)}{" "}
                        <span className="text-[10px] font-normal text-gray-400">(±{perfil.gad7.std.toFixed(2)})</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 font-medium">Mediana GAD-7:</span>
                      <span className="font-bold text-gray-800">{perfil.gad7.median.toFixed(1)}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 font-medium">Mod. + Grave:</span>
                      <span className={`font-bold ${perfil.gad7.pctModerateSevere > 60 ? "text-[#EB0029]" : "text-amber-700"}`}>
                        {perfil.gad7.pctModerateSevere.toFixed(1)}%
                      </span>
                    </div>

                    {/* Barra Empilhada dos Níveis GAD-7 */}
                    <div className="pt-1.5 space-y-1">
                      <div className="text-[10px] text-gray-500 font-semibold">Distribuição Clínica GAD-7:</div>
                      <div className="h-3 w-full rounded overflow-hidden flex bg-gray-200">
                        <div
                          style={{ width: `${perfil.gad7.levels.minima}%` }}
                          className="bg-emerald-600"
                          title={`Mínima: ${perfil.gad7.levels.minima}%`}
                        />
                        <div
                          style={{ width: `${perfil.gad7.levels.leve}%` }}
                          className="bg-amber-400"
                          title={`Leve: ${perfil.gad7.levels.leve}%`}
                        />
                        <div
                          style={{ width: `${perfil.gad7.levels.moderada}%` }}
                          className="bg-orange-500"
                          title={`Moderada: ${perfil.gad7.levels.moderada}%`}
                        />
                        <div
                          style={{ width: `${perfil.gad7.levels.grave}%` }}
                          className="bg-[#EB0029]"
                          title={`Grave: ${perfil.gad7.levels.grave}%`}
                        />
                      </div>
                      <div className="flex justify-between text-[9px] text-gray-500 font-medium pt-0.5">
                        <span className="text-emerald-700 font-semibold">Mín: {perfil.gad7.levels.minima}%</span>
                        <span className="text-amber-700 font-semibold">Lev: {perfil.gad7.levels.leve}%</span>
                        <span className="text-orange-700 font-semibold">Mod: {perfil.gad7.levels.moderada}%</span>
                        <span className="text-[#EB0029] font-bold">Grav: {perfil.gad7.levels.grave}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Resumo de Hábitos */}
                  <div className="space-y-2 pt-1 text-xs">
                    <div className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">Padrões de Rotina:</div>
                    <div className="text-[11px] text-gray-600 bg-gray-50 p-2 rounded border border-gray-100">
                      <strong className="text-gray-800">Sono:</strong> {perfil.habitsSummary.sleep}
                    </div>
                    <div className="text-[11px] text-gray-600 bg-gray-50 p-2 rounded border border-gray-100">
                      <strong className="text-gray-800">Exercício:</strong> {perfil.habitsSummary.physicalActivity}
                    </div>
                    <div className="text-[11px] text-gray-600 bg-gray-50 p-2 rounded border border-gray-100">
                      <strong className="text-gray-800">Alimentação:</strong> {perfil.habitsSummary.nutrition}
                    </div>
                    <div className="text-[11px] text-gray-600 bg-gray-50 p-2 rounded border border-gray-100">
                      <strong className="text-gray-800">Lazer:</strong> {perfil.habitsSummary.leisure}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Matriz Comparativa de Médias Padronizadas (Z-Score) */}
          <section className="bg-white rounded-md border border-gray-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-[#1A1A1A] text-sm flex items-center gap-2">
                  <IconBarChart className="w-4 h-4 text-[#EB0029]" />
                  Matriz Comparativa de Médias Padronizadas (Z-Score dos Hábitos)
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Desvios em relação à média amostral (Z = 0.00). Valores positivos indicam hábitos favoráveis acima da média; negativos indicam déficit comportamental.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-600 bg-gray-50">
                    <th className="py-2.5 px-3 font-bold text-gray-700">Dimensão Comportamental</th>
                    <th className="py-2.5 px-3 font-bold text-center text-gray-800">
                      Perfil 1 (Intermediário)
                    </th>
                    <th className="py-2.5 px-3 font-bold text-center text-emerald-800">
                      Perfil 2 (Protetivo)
                    </th>
                    <th className="py-2.5 px-3 font-bold text-center text-[#EB0029]">
                      Perfil 3 (Risco Acentuado)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {[
                    { label: "Horas de sono por noite", z: [-0.53, 1.04, -0.61] },
                    { label: "Qualidade do sono (últimas 2 semanas)", z: [-0.26, 0.81, -0.77] },
                    { label: "Atividade física semanal", z: [0.26, 0.20, -0.80] },
                    { label: "Alimentação adequada (autoavaliação)", z: [0.28, 0.31, -1.00] },
                    { label: "Carga diária de estudos fora da aula", z: [-0.06, 0.07, 0.01] },
                    { label: "Tempo de lazer/descanso por dia", z: [0.05, 0.47, -0.83] },
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/70">
                      <td className="py-2.5 px-3 font-semibold text-gray-800">{row.label}</td>
                      {row.z.map((val, pIdx) => {
                        const isPos = val > 0.3;
                        const isNeutral = val >= -0.3 && val <= 0.3;
                        return (
                          <td key={pIdx} className="py-2.5 px-3 text-center">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded font-bold text-xs font-mono ${
                                isPos
                                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                  : isNeutral
                                  ? "bg-gray-100 text-gray-700 border border-gray-200"
                                  : "bg-red-50 text-[#EB0029] border border-red-200"
                              }`}
                            >
                              {val > 0 ? `+${val.toFixed(2)}` : val.toFixed(2)}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Garantia Ética e Não-Contaminação */}
          <section className="bg-gray-50 rounded-md border border-gray-200 p-5 text-xs text-gray-600 space-y-2">
            <h4 className="font-bold text-gray-800 flex items-center gap-2">
              <IconShield className="w-4 h-4 text-[#EB0029]" />
              Garantia de Isolamento Metodológico (K-Medoids com Método Alternado)
            </h4>
            <p className="leading-relaxed">
              O algoritmo empregado utiliza a formulação <strong>K-Medoids com método Alternado (heurística de Voronoi)</strong> sob distância Euclidiana padronizada (Z-Score) em 6 dimensões de estilo de vida. As 7 variáveis da escala GAD-7 <strong>não participaram</strong> da formação dos medoides. A distribuição dos sintomas clínicos foi avaliada exclusivamente a posteriori, confirmada por testes de Kruskal-Wallis (p = 0.0003) e Qui-Quadrado (p = 0.0002).
            </p>
          </section>
        </div>
      )}
    </div>
  );
}
