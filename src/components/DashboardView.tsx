"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { CampusMap, MapLayer } from "@/components/CampusMap";
import {
  AcademicUnit,
  OverviewData,
  FilterCubeItem,
  GadAggregate,
} from "@/types/dashboard";
import {
  IconShield,
  IconInfo,
  IconFilter,
  IconReset,
  IconUser,
  IconHeart,
  IconActivity,
  IconAlert,
  IconCheck,
  IconBuilding,
  IconBarChart,
  IconMoon,
  IconClock,
  IconBook,
  IconScale,
} from "@/components/Icons";

interface DashboardViewProps {
  overview: OverviewData;
  units: AcademicUnit[];
  filterCube: FilterCubeItem[];
}

export function DashboardView({
  overview,
  units,
  filterCube,
}: DashboardViewProps) {
  // Filtros ativos
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [selectedTurno, setSelectedTurno] = useState<string>("todos");
  const [selectedTrabalha, setSelectedTrabalha] = useState<string>("todos");
  const [activeLayer, setActiveLayer] = useState<MapLayer>("mean");

  // Abas de navegação analítica
  const [activeTab, setActiveTab] = useState<"ansiedade" | "habitos" | "academico">("ansiedade");

  // Estado do Modal "Sobre a Amostra"
  const [showSampleModal, setShowSampleModal] = useState<boolean>(false);

  // Unidade atualmente selecionada
  const selectedUnit = useMemo(() => {
    if (!selectedUnitId) return null;
    return units.find((u) => u.id === selectedUnitId) || null;
  }, [selectedUnitId, units]);

  // Recorte institucional ativo
  const currentMetrics = useMemo<GadAggregate>(() => {
    const unitAcronym = selectedUnit ? selectedUnit.acronym : null;
    const turnoVal = selectedTurno === "todos" ? null : selectedTurno;
    const trabalhaVal = selectedTrabalha === "todos" ? null : selectedTrabalha;

    if (!unitAcronym && !turnoVal && !trabalhaVal) {
      return overview.overallGad7;
    }

    const match = filterCube.find(
      (c) =>
        c.filters.unidade === unitAcronym &&
        c.filters.turno === turnoVal &&
        c.filters.trabalha === trabalhaVal
    );

    if (match) return match.metrics;
    if (selectedUnit) return selectedUnit.metrics;
    return overview.overallGad7;
  }, [overview, selectedUnit, selectedTurno, selectedTrabalha, filterCube]);

  // Sinais Observados Determinísticos (Sem IA, puramente baseados em regras matemáticas auditáveis)
  const deterministicInsights = useMemo(() => {
    const insights: string[] = [];
    const overallModGrave = Math.round((overview.overallGad7.pct_moderate_severe ?? 0) * 100);
    const overallMean = overview.overallGad7.mean ?? 10.2;

    if (selectedUnit && !selectedUnit.metrics.suppressed) {
      const unitModGrave = Math.round((selectedUnit.metrics.pct_moderate_severe ?? 0) * 100);
      const diffModGrave = unitModGrave - overallModGrave;
      const unitPctSample = Math.round((selectedUnit.metrics.n / overview.metadata.eligibleResponses) * 100);

      insights.push(
        `A unidade ${selectedUnit.acronym} concentra ${selectedUnit.metrics.n} estudantes (${unitPctSample}% da amostra analisada no campus).`
      );

      if (Math.abs(diffModGrave) >= 2) {
        const sentido = diffModGrave > 0 ? "acima" : "abaixo";
        insights.push(
          `A proporção de sintomas moderados/graves na unidade está ${Math.abs(diffModGrave)} p.p. ${sentido} da média geral institucional (${unitModGrave}% vs ${overallModGrave}%).`
        );
      } else {
        insights.push(
          `A proporção de sintomas moderados/graves na unidade (${unitModGrave}%) alinha-se estreitamente com a média geral do campus (${overallModGrave}%).`
        );
      }
    } else {
      insights.push(
        `Na amostra geral do Campus Higienópolis, ${overallModGrave}% dos participantes atingiram pontuação correspondente a sintomas moderados ou graves (GAD-7 ≥ 10).`
      );
      insights.push(
        `O escore médio geral observado é de ${overallMean} pontos, com desvio padrão de ±${overview.overallGad7.std ?? 5.54}.`
      );
    }

    // Insight de hábitos
    if (overview.crossHabits.sleepHours && overview.crossHabits.sleepHours.length > 0) {
      const topSleep = [...overview.crossHabits.sleepHours].sort((a, b) => b.n - a.n)[0];
      insights.push(
        `A faixa de sono mais frequente é de "${topSleep.category}", relatada por ${Math.round(topSleep.pctOfTotal * 100)}% dos estudantes participantes.`
      );
    }

    return insights;
  }, [overview, selectedUnit]);

  // Dot Plot Data: Comparativo Unidade Selecionada vs Campus Geral
  const comparisonData = useMemo(() => {
    const generalMean = overview.overallGad7.mean ?? 10.2;
    const generalModGrave = (overview.overallGad7.pct_moderate_severe ?? 0.54) * 100;

    // Métricas da unidade se não suprimida
    const unitMean = selectedUnit && !selectedUnit.metrics.suppressed ? selectedUnit.metrics.mean ?? generalMean : null;
    const unitModGrave = selectedUnit && !selectedUnit.metrics.suppressed ? (selectedUnit.metrics.pct_moderate_severe ?? 0.54) * 100 : null;

    return [
      {
        metric: "GAD-7 Médio",
        general: generalMean,
        unit: unitMean,
        unitLabel: unitMean !== null ? `${unitMean}` : "Suprimido",
        generalLabel: `${generalMean}`,
        scaleMin: 0,
        scaleMax: 21,
      },
      {
        metric: "% Sintomas Moderados / Graves",
        general: generalModGrave,
        unit: unitModGrave,
        unitLabel: unitModGrave !== null ? `${Math.round(unitModGrave)}%` : "Suprimido",
        generalLabel: `${Math.round(generalModGrave)}%`,
        scaleMin: 0,
        scaleMax: 100,
      },
    ];
  }, [overview, selectedUnit]);

  const handleResetFilters = () => {
    setSelectedUnitId(null);
    setSelectedTurno("todos");
    setSelectedTrabalha("todos");
  };

  const hasActiveFilters =
    selectedUnitId !== null ||
    selectedTurno !== "todos" ||
    selectedTrabalha !== "todos";

  return (
    <div className="space-y-6">
      {/* 1. Barra de Contexto Institucional e Filtros Globais */}
      <section className="bg-white rounded-md border border-gray-200 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-[#1A1A1A] text-lg sm:text-xl tracking-tight">
                Mapa da Ansiedade — Exploração Institucional
              </span>
              <span className="text-[11px] font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded border border-gray-200">
                UPM • Higienópolis
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Navegue pelo campus para definir o contexto espacial e explore as perspectivas de ansiedade e hábitos.
            </p>
          </div>

          {/* Botão de Amostra e Limitações */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSampleModal(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors border border-gray-200"
            >
              <IconBook className="w-3.5 h-3.5 text-[#EB0029]" />
              Sobre a Amostra &amp; Limitações
            </button>
          </div>
        </div>

        {/* Linha de Filtros Reativos */}
        <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-gray-500 font-medium flex items-center gap-1">
              <IconFilter className="w-3.5 h-3.5 text-[#EB0029]" />
              Filtro Global:
            </span>

            <select
              value={selectedTurno}
              onChange={(e) => setSelectedTurno(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded px-2.5 py-1 text-gray-700 font-medium focus:outline-none"
            >
              <option value="todos">Turno: Todos</option>
              <option value="Noturno">Noturno</option>
              <option value="Matutino">Matutino</option>
              <option value="Integral">Integral</option>
            </select>

            <select
              value={selectedTrabalha}
              onChange={(e) => setSelectedTrabalha(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded px-2.5 py-1 text-gray-700 font-medium focus:outline-none"
            >
              <option value="todos">Trabalho: Todos</option>
              <option value="Sim">Trabalha (Sim)</option>
              <option value="Não">Não Trabalha</option>
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#EB0029] bg-red-50 hover:bg-red-100 px-2 py-1 rounded border border-red-200 transition-colors"
              >
                <IconReset className="w-3 h-3" />
                Limpar
              </button>
            )}
          </div>

          <div className="text-[11px] text-gray-500">
            Contexto selecionado:{" "}
            <strong className="text-gray-900">
              {selectedUnit ? `${selectedUnit.name} (${selectedUnit.acronym})` : "Campus Geral (Todos os Prédios)"}
            </strong>
          </div>
        </div>
      </section>

      {/* 2. Núcleo Superior: Mapa Oficial + Painel Lateral da Unidade Selecionada */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Mapa do Campus como Ferramenta Central de Seleção Espacial (7 colunas) */}
        <div className="lg:col-span-8">
          <CampusMap
            campus={overview.campi[0]}
            units={units}
            selectedUnitId={selectedUnitId}
            onSelectUnit={(id) => setSelectedUnitId(id)}
            activeLayer={activeLayer}
            onLayerChange={(l) => setActiveLayer(l)}
          />
        </div>

        {/* Painel da Unidade Selecionada (5 colunas) */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-md border border-gray-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <IconBuilding className="w-4 h-4 text-[#EB0029]" />
                <h3 className="font-bold text-[#1A1A1A] text-sm">
                  {selectedUnit ? selectedUnit.name : "Painel da Unidade"}
                </h3>
              </div>
              {selectedUnit && (
                <button
                  type="button"
                  onClick={() => setSelectedUnitId(null)}
                  className="text-xs font-semibold text-gray-400 hover:text-gray-600"
                >
                  Desmarcar
                </button>
              )}
            </div>

            {!selectedUnit ? (
              <div className="py-6 text-center text-gray-500 space-y-3">
                <IconBuilding className="w-8 h-8 text-gray-300 mx-auto" />
                <p className="text-xs font-medium">
                  Selecione um prédio no mapa do campus para inspecionar os dados da unidade correspondente.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedUnitId("fci")}
                    className="text-xs font-bold px-2.5 py-1 rounded bg-red-50 hover:bg-red-100 text-[#EB0029] border border-red-200 transition-colors"
                  >
                    FCI (Prédio 31)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedUnitId("ccbs")}
                    className="text-xs font-bold px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors"
                  >
                    CCBS (38/50)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedUnitId("fdir")}
                    className="text-xs font-bold px-2.5 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 transition-colors"
                  >
                    FDIR (3/24)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedUnitId("ccl")}
                    className="text-xs font-bold px-2.5 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 transition-colors"
                  >
                    CCL (48/49)
                  </button>
                </div>
              </div>
            ) : selectedUnit.metrics.suppressed ? (
              <div className="p-4 bg-gray-50 rounded border border-gray-200 space-y-2 text-gray-700">
                <div className="flex items-center gap-2 text-amber-700 font-bold text-xs">
                  <IconAlert className="w-4 h-4" />
                  Amostra Insuficiente para Exibição
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  A unidade <strong>{selectedUnit.name}</strong> possui amostra inferior a 10 respondentes ({selectedUnit.metrics.n} resposta(s)).
                </p>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Em conformidade com a LGPD e normas éticas de pesquisa, os dados são suprimidos para impossibilitar inferência individual.
                </p>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#EB0029] bg-red-50 border border-red-100 px-2.5 py-0.5 rounded">
                      {selectedUnit.acronym} — Prédio {selectedUnit.primaryBuildingId}
                    </span>
                    <span className="text-gray-500 font-medium">
                      Amostra: <strong className="text-gray-900">{selectedUnit.metrics.n}</strong>
                    </span>
                  </div>
                  <p className="text-gray-600 mt-2 text-[11px] leading-relaxed">
                    {selectedUnit.description}
                  </p>
                </div>

                {/* Métricas Principais da Unidade */}
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-500 text-[11px] block">GAD-7 Médio</span>
                    <span className="text-base font-black text-slate-900">{selectedUnit.metrics.mean}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-500 text-[11px] block">Mediana</span>
                    <span className="text-base font-black text-slate-900">{selectedUnit.metrics.median}</span>
                  </div>
                </div>

                {/* Distribuição Compacta das 4 Faixas GAD-7 */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-700">
                    <span>Faixas de Sintomas (GAD-7)</span>
                    <span className="text-orange-700 font-bold">
                      {Math.round((selectedUnit.metrics.pct_moderate_severe ?? 0) * 100)}% Mod./Grave
                    </span>
                  </div>

                  {/* Barra Compacta 100% Empilhada */}
                  <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-100 border border-slate-200">
                    <div
                      title={`Mínima: ${Math.round((selectedUnit.metrics.levels?.minima ?? 0) * 100)}%`}
                      style={{ width: `${(selectedUnit.metrics.levels?.minima ?? 0) * 100}%` }}
                      className="bg-emerald-500"
                    ></div>
                    <div
                      title={`Leve: ${Math.round((selectedUnit.metrics.levels?.leve ?? 0) * 100)}%`}
                      style={{ width: `${(selectedUnit.metrics.levels?.leve ?? 0) * 100}%` }}
                      className="bg-amber-400"
                    ></div>
                    <div
                      title={`Moderada: ${Math.round((selectedUnit.metrics.levels?.moderada ?? 0) * 100)}%`}
                      style={{ width: `${(selectedUnit.metrics.levels?.moderada ?? 0) * 100}%` }}
                      className="bg-orange-500"
                    ></div>
                    <div
                      title={`Grave: ${Math.round((selectedUnit.metrics.levels?.grave ?? 0) * 100)}%`}
                      style={{ width: `${(selectedUnit.metrics.levels?.grave ?? 0) * 100}%` }}
                      className="bg-red-700"
                    ></div>
                  </div>

                  <div className="grid grid-cols-4 text-[10px] text-slate-600 pt-1 text-center font-medium">
                    <div>Mín: {Math.round((selectedUnit.metrics.levels?.minima ?? 0) * 100)}%</div>
                    <div>Leve: {Math.round((selectedUnit.metrics.levels?.leve ?? 0) * 100)}%</div>
                    <div>Mod: {Math.round((selectedUnit.metrics.levels?.moderada ?? 0) * 100)}%</div>
                    <div>Grave: {Math.round((selectedUnit.metrics.levels?.grave ?? 0) * 100)}%</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. KPIs Reduzidos (4 cards principais) + Barra Empilhada 100% Geral */}
      <section className="bg-white rounded-md border border-gray-200 p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 bg-gray-50 rounded border border-gray-200">
            <span className="text-[11px] font-semibold text-gray-500 block uppercase tracking-wider">Amostra Elegível (n)</span>
            <div className="text-2xl font-black text-[#1A1A1A] mt-0.5">
              {currentMetrics.n}
            </div>
            <span className="text-[10px] text-gray-400">
              {currentMetrics.suppressed ? "Amostra suprimida" : "Respostas válidas"}
            </span>
          </div>

          <div className="p-3.5 bg-gray-50 rounded border border-gray-200">
            <span className="text-[11px] font-semibold text-gray-500 block uppercase tracking-wider">GAD-7 Médio</span>
            <div className="text-2xl font-black text-[#EB0029] mt-0.5">
              {currentMetrics.suppressed ? "—" : currentMetrics.mean ?? "—"}
            </div>
            <span className="text-[10px] text-gray-400">Escala padronizada 0 a 21</span>
          </div>

          <div className="p-3.5 bg-gray-50 rounded border border-gray-200">
            <span className="text-[11px] font-semibold text-gray-500 block uppercase tracking-wider">Mediana GAD-7</span>
            <div className="text-2xl font-black text-[#1A1A1A] mt-0.5">
              {currentMetrics.suppressed ? "—" : currentMetrics.median ?? "—"}
            </div>
            <span className="text-[10px] text-gray-400">Desvio: ±{currentMetrics.std ?? 0}</span>
          </div>

          <div className="p-3.5 bg-gray-50 rounded border border-gray-200">
            <span className="text-[11px] font-semibold text-gray-500 block uppercase tracking-wider">% Moderada / Grave</span>
            <div className="text-2xl font-black text-amber-700 mt-0.5">
              {currentMetrics.suppressed ? "—" : `${Math.round((currentMetrics.pct_moderate_severe ?? 0) * 100)}%`}
            </div>
            <span className="text-[10px] text-gray-400">Score GAD-7 ≥ 10</span>
          </div>
        </div>

        {/* Barra Empilhada 100% de Distribuição de Sintomas */}
        {!currentMetrics.suppressed && (
          <div className="pt-2 border-t border-gray-100 space-y-1.5">
            <div className="flex justify-between items-center text-xs font-semibold text-gray-700">
              <span>Distribuição das 4 Classificações Clínicas do GAD-7</span>
              <span className="text-gray-400 text-[11px]">Total 100% da amostra</span>
            </div>

            <div className="w-full h-4 rounded overflow-hidden flex bg-gray-100 border border-gray-200">
              <div
                title={`Ansiedade Mínima (0-4): ${Math.round((currentMetrics.levels?.minima ?? 0) * 100)}%`}
                style={{ width: `${(currentMetrics.levels?.minima ?? 0) * 100}%` }}
                className="bg-emerald-600 flex items-center justify-center text-[10px] font-bold text-white transition-all"
              >
                {(currentMetrics.levels?.minima ?? 0) > 0.1 && `${Math.round((currentMetrics.levels?.minima ?? 0) * 100)}%`}
              </div>
              <div
                title={`Ansiedade Leve (5-9): ${Math.round((currentMetrics.levels?.leve ?? 0) * 100)}%`}
                style={{ width: `${(currentMetrics.levels?.leve ?? 0) * 100}%` }}
                className="bg-amber-400 flex items-center justify-center text-[10px] font-bold text-[#1A1A1A] transition-all"
              >
                {(currentMetrics.levels?.leve ?? 0) > 0.1 && `${Math.round((currentMetrics.levels?.leve ?? 0) * 100)}%`}
              </div>
              <div
                title={`Ansiedade Moderada (10-14): ${Math.round((currentMetrics.levels?.moderada ?? 0) * 100)}%`}
                style={{ width: `${(currentMetrics.levels?.moderada ?? 0) * 100}%` }}
                className="bg-orange-500 flex items-center justify-center text-[10px] font-bold text-white transition-all"
              >
                {(currentMetrics.levels?.moderada ?? 0) > 0.1 && `${Math.round((currentMetrics.levels?.moderada ?? 0) * 100)}%`}
              </div>
              <div
                title={`Ansiedade Grave (15-21): ${Math.round((currentMetrics.levels?.grave ?? 0) * 100)}%`}
                style={{ width: `${(currentMetrics.levels?.grave ?? 0) * 100}%` }}
                className="bg-[#EB0029] flex items-center justify-center text-[10px] font-bold text-white transition-all"
              >
                {(currentMetrics.levels?.grave ?? 0) > 0.1 && `${Math.round((currentMetrics.levels?.grave ?? 0) * 100)}%`}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-600 pt-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                <span>Mínima (0–4)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <span>Leve (5–9)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                <span>Moderada (10–14)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EB0029]"></span>
                <span>Grave (15–21)</span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 4. Comparativo Unidade Selecionada × Campus Geral (Dot Plot Compacto) + Sinais Observados */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Dot Plot Compacto (7 colunas) */}
        <div className="md:col-span-7 bg-white rounded-md border border-gray-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h3 className="font-bold text-[#1A1A1A] text-xs sm:text-sm flex items-center gap-2">
              <IconScale className="w-4 h-4 text-[#EB0029]" />
              Comparativo: Unidade × Campus Geral (Dot Plot)
            </h3>
            <div className="flex items-center gap-3 text-[10px] font-semibold text-gray-500">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EB0029] inline-block"></span> Unidade
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-gray-400 inline-block"></span> Campus Geral
              </span>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {comparisonData.map((row, idx) => {
              const unitPos = row.unit !== null ? ((row.unit - row.scaleMin) / (row.scaleMax - row.scaleMin)) * 100 : null;
              const genPos = ((row.general - row.scaleMin) / (row.scaleMax - row.scaleMin)) * 100;

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-gray-700">{row.metric}</span>
                    <span className="text-[11px] text-gray-500">
                      Unidade: <strong className="text-[#EB0029]">{row.unitLabel}</strong> | Geral:{" "}
                      <strong className="text-gray-900">{row.generalLabel}</strong>
                    </span>
                  </div>

                  {/* Linha do Dot Plot */}
                  <div className="relative w-full h-6 flex items-center">
                    <div className="w-full h-1 bg-gray-200 rounded"></div>

                    {/* Ponto Campus Geral */}
                    <div
                      title={`Campus Geral: ${row.generalLabel}`}
                      style={{ left: `${genPos}%` }}
                      className="absolute -ml-2 w-4 h-4 rounded-full bg-gray-500 border-2 border-white shadow-xs z-10"
                    ></div>

                    {/* Ponto Unidade (se houver e não for suprimida) */}
                    {unitPos !== null && (
                      <div
                        title={`Unidade: ${row.unitLabel}`}
                        style={{ left: `${unitPos}%` }}
                        className="absolute -ml-2 w-4 h-4 rounded-full bg-[#EB0029] border-2 border-white shadow-xs z-20"
                      ></div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sinais Observados Determinísticos (5 colunas) */}
        <div className="md:col-span-5 bg-white rounded-md border border-gray-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <IconActivity className="w-4 h-4 text-[#EB0029]" />
            <h3 className="font-bold text-[#1A1A1A] text-xs sm:text-sm">
              Sinais Observados (Regras Auditáveis)
            </h3>
          </div>

          <ul className="space-y-2.5 text-xs text-gray-600">
            {deterministicInsights.map((insight, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-gray-50 p-2.5 rounded border border-gray-100">
                <span className="w-1.5 h-1.5 rounded-full bg-[#EB0029] shrink-0 mt-1.5"></span>
                <span className="leading-relaxed">{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 5. Navegação Analítica por Abas (Ansiedade, Hábitos, Acadêmico, Perfis) */}
      <section className="bg-white rounded-md border border-gray-200 p-5 shadow-xs space-y-5">
        {/* Barra de Abas Institucional UPM */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200">
          <div className="flex items-center -mb-px space-x-1 sm:space-x-2">
            <button
              type="button"
              onClick={() => setActiveTab("ansiedade")}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                activeTab === "ansiedade"
                  ? "border-[#EB0029] text-[#EB0029]"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
              }`}
            >
              Ansiedade (GAD-7)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("habitos")}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                activeTab === "habitos"
                  ? "border-[#EB0029] text-[#EB0029]"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
              }`}
            >
              Hábitos de Vida
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("academico")}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                activeTab === "academico"
                  ? "border-[#EB0029] text-[#EB0029]"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
              }`}
            >
              Perfil Acadêmico
            </button>

            <Link
              href="/perfis"
              className="px-4 py-2.5 text-xs font-semibold text-gray-600 hover:text-[#EB0029] border-b-2 border-transparent hover:border-gray-300 flex items-center gap-1.5 transition-all"
            >
              <span>Perfis Comportamentais</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                K=3
              </span>
            </Link>
          </div>

          <div className="text-[11px] text-gray-500 pb-2">
            Perspectiva: <strong className="text-gray-900 capitalize">{activeTab}</strong>
          </div>
        </div>

        {/* Conteúdo da Aba 1: Ansiedade */}
        {activeTab === "ansiedade" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Histograma GAD-7 (0 a 21) */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800">Histograma dos Escores GAD-7 (0 a 21)</span>
                  <span className="text-[11px] text-slate-400">n = {overview.metadata.eligibleResponses}</span>
                </div>
                <div className="h-44 flex items-end gap-1 px-1 bg-slate-50 p-2 rounded-xl border border-slate-100">
                  {overview.gad7Distribution.map((item) => {
                    const maxCount = Math.max(...overview.gad7Distribution.map((d) => d.count), 1);
                    const heightPct = Math.round((item.count / maxCount) * 100);
                    const isHigh = item.score >= 10;
                    return (
                      <div key={item.score} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group relative">
                        <div className="absolute -top-7 bg-slate-800 text-white text-[9px] font-bold px-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
                          Score {item.score}: {item.count}
                        </div>
                        <div
                          className={`w-full rounded-t ${isHigh ? "bg-red-800" : "bg-slate-300"}`}
                          style={{ height: `${Math.max(heightPct, 4)}%` }}
                        ></div>
                        <span className="text-[8px] text-slate-400">{item.score % 3 === 0 ? item.score : ""}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Boxplot Estatístico Comparativo (Dispersão) */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800">Boxplot Estatístico de Dispersão do GAD-7</span>
                  <span className="text-[11px] text-slate-400">Min, Q1, Mediana, Q3, Max</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-4">
                  {/* Linha Campus Geral */}
                  {(() => {
                    const bp = overview.overallGad7.boxplot;
                    if (!bp) return null;
                    return (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-slate-700">
                          <span>Campus Geral (UPM)</span>
                          <span className="text-[11px] text-slate-500">Q1: {bp.q1} | Mediana: {bp.median} | Q3: {bp.q3}</span>
                        </div>
                        <div className="relative w-full h-6 flex items-center">
                          <div className="w-full h-1 bg-slate-200 rounded-full"></div>
                          {/* Caixa IQR Q1 a Q3 */}
                          <div
                            style={{
                              left: `${(bp.q1 / 21) * 100}%`,
                              width: `${((bp.q3 - bp.q1) / 21) * 100}%`,
                            }}
                            className="absolute h-4 bg-slate-300/80 border border-slate-400 rounded-sm"
                          ></div>
                          {/* Traço da Mediana */}
                          <div
                            style={{ left: `${(bp.median / 21) * 100}%` }}
                            className="absolute w-1 h-5 bg-slate-800 -ml-0.5 rounded-full"
                          ></div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Linha FCI se selecionada */}
                  {selectedUnit && !selectedUnit.metrics.suppressed && selectedUnit.metrics.boxplot && (
                    <div className="space-y-1 pt-2 border-t border-slate-200">
                      <div className="flex justify-between text-xs font-semibold text-red-900">
                        <span>{selectedUnit.acronym} ({selectedUnit.name})</span>
                        <span className="text-[11px] text-slate-500">
                          Q1: {selectedUnit.metrics.boxplot.q1} | Mediana: {selectedUnit.metrics.boxplot.median} | Q3: {selectedUnit.metrics.boxplot.q3}
                        </span>
                      </div>
                      <div className="relative w-full h-6 flex items-center">
                        <div className="w-full h-1 bg-slate-200 rounded-full"></div>
                        <div
                          style={{
                            left: `${(selectedUnit.metrics.boxplot.q1 / 21) * 100}%`,
                            width: `${((selectedUnit.metrics.boxplot.q3 - selectedUnit.metrics.boxplot.q1) / 21) * 100}%`,
                          }}
                          className="absolute h-4 bg-red-200/90 border border-red-800 rounded-sm"
                        ></div>
                        <div
                          style={{ left: `${(selectedUnit.metrics.boxplot.median / 21) * 100}%` }}
                          className="absolute w-1 h-5 bg-red-900 -ml-0.5 rounded-full"
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Conteúdo da Aba 2: Hábitos (Barras 100% Empilhadas por Hábito) */}
        {activeTab === "habitos" && (
          <div className="space-y-6 text-xs">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <span className="font-bold text-slate-900">
                Análise Cruzada: Categorias de Hábitos × Proporção de Sintomas GAD-7 (Barras 100%)
              </span>
              <span className="text-[11px] text-slate-400">Puramente descritivo • Sem inferência causal</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Horas de Sono x Níveis GAD-7 */}
              <div className="space-y-2">
                <span className="font-semibold text-slate-800 block">Horas de Sono por Noite</span>
                <div className="space-y-2">
                  {overview.crossHabits.sleepHours?.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="font-medium text-slate-700">{item.category} (n={item.n})</span>
                        <span className="text-slate-400">Score médio: {item.meanGad7}</span>
                      </div>
                      <div className="w-full h-3 rounded flex overflow-hidden bg-slate-100 border border-slate-200">
                        <div title={`Mínima: ${Math.round(item.levels.minima * 100)}%`} style={{ width: `${item.levels.minima * 100}%` }} className="bg-emerald-500"></div>
                        <div title={`Leve: ${Math.round(item.levels.leve * 100)}%`} style={{ width: `${item.levels.leve * 100}%` }} className="bg-amber-400"></div>
                        <div title={`Moderada: ${Math.round(item.levels.moderada * 100)}%`} style={{ width: `${item.levels.moderada * 100}%` }} className="bg-orange-500"></div>
                        <div title={`Grave: ${Math.round(item.levels.grave * 100)}%`} style={{ width: `${item.levels.grave * 100}%` }} className="bg-red-700"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Atividade Física x Níveis GAD-7 */}
              <div className="space-y-2">
                <span className="font-semibold text-slate-800 block">Atividade Física Semanal</span>
                <div className="space-y-2">
                  {overview.crossHabits.physicalActivity?.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="font-medium text-slate-700">{item.category} (n={item.n})</span>
                        <span className="text-slate-400">Score médio: {item.meanGad7}</span>
                      </div>
                      <div className="w-full h-3 rounded flex overflow-hidden bg-slate-100 border border-slate-200">
                        <div title={`Mínima: ${Math.round(item.levels.minima * 100)}%`} style={{ width: `${item.levels.minima * 100}%` }} className="bg-emerald-500"></div>
                        <div title={`Leve: ${Math.round(item.levels.leve * 100)}%`} style={{ width: `${item.levels.leve * 100}%` }} className="bg-amber-400"></div>
                        <div title={`Moderada: ${Math.round(item.levels.moderada * 100)}%`} style={{ width: `${item.levels.moderada * 100}%` }} className="bg-orange-500"></div>
                        <div title={`Grave: ${Math.round(item.levels.grave * 100)}%`} style={{ width: `${item.levels.grave * 100}%` }} className="bg-red-700"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Conteúdo da Aba 3: Perfil Acadêmico */}
        {activeTab === "academico" && (
          <div className="space-y-5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Situação de Trabalho */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <span className="font-bold text-slate-800 block">Trabalha Atualmente?</span>
                {overview.academic.workStatus?.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-slate-600">
                    <span>{item.category}</span>
                    <strong className="text-slate-900">{Math.round(item.pct * 100)}% (n={item.n})</strong>
                  </div>
                ))}
              </div>

              {/* Faltas Recorrentes */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <span className="font-bold text-slate-800 block">Faltas Recorrentes no Semestre</span>
                {overview.academic.absences?.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-slate-600">
                    <span>{item.category}</span>
                    <strong className="text-slate-900">{Math.round(item.pct * 100)}%</strong>
                  </div>
                ))}
              </div>

              {/* Trancamento de Disciplinas */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <span className="font-bold text-slate-800 block">Trancou Disciplina no Último Ano?</span>
                {overview.academic.courseDrop?.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-slate-600">
                    <span>{item.category}</span>
                    <strong className="text-slate-900">{Math.round(item.pct * 100)}%</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 6. Modal / Drawer: "Sobre a Amostra e Limitações Metodológicas" */}
      {showSampleModal && (
        <div className="fixed inset-0 z-50 bg-[#1A1A1A]/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-md max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-4 shadow-xl border border-gray-200 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <IconBook className="w-5 h-5 text-[#EB0029]" />
                <h3 className="font-bold text-[#1A1A1A] text-base">
                  Sobre a Amostra e Limitações Metodológicas
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSampleModal(false)}
                className="text-gray-400 hover:text-[#EB0029] font-bold text-base transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-amber-50 rounded border border-amber-200 text-amber-900 space-y-1">
              <strong className="block font-bold">Nota de Transparência Científica:</strong>
              <p className="leading-relaxed">
                A amostra da pesquisa é de <strong>conveniência</strong> e voluntária, apresentando distribuição desigual entre unidades acadêmicas (com forte concentração na FCI).
                Os resultados <strong>não devem ser extrapolados</strong> como censo ou amostra probabilística representativa de toda a Universidade Presbiteriana Mackenzie.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-gray-800 text-sm">Distribuição das Respostas Elegíveis (n = {overview.metadata.eligibleResponses})</h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded border border-gray-200 space-y-1.5">
                  <span className="font-bold text-gray-800 block">Por Unidade Acadêmica</span>
                  {overview.sampleDistribution.byUnit.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-gray-600 text-[11px]">
                      <span>{item.name}</span>
                      <strong className="text-gray-900">{item.count} ({Math.round(item.pct * 100)}%)</strong>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-gray-50 rounded border border-gray-200 space-y-1.5">
                  <span className="font-bold text-gray-800 block">Por Turno</span>
                  {overview.sampleDistribution.byTurno.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-gray-600 text-[11px]">
                      <span>{item.name}</span>
                      <strong className="text-gray-900">{item.count} ({Math.round(item.pct * 100)}%)</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSampleModal(false)}
                className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#EB0029] text-white font-bold rounded text-xs transition-colors"
              >
                Entendido e Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
