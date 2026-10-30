"use client";

import React, { useState, useRef } from "react";
import { AcademicUnit, CampusConfig } from "@/types/dashboard";
import {
  IconZoomIn,
  IconZoomOut,
  IconReset,
  IconBuilding,
} from "@/components/Icons";

export type MapLayer = "sample" | "mean" | "moderate_severe" | "grave";

interface CampusMapProps {
  campus?: CampusConfig;
  units: AcademicUnit[];
  selectedUnitId: string | null;
  onSelectUnit: (unitId: string | null) => void;
  activeLayer: MapLayer;
  onLayerChange: (layer: MapLayer) => void;
}

interface BuildingHotspot {
  buildingId: string;
  unitId: string;
  name: string;
  polygon: string;
  pin: { x: number; y: number };
  focusView: { zoom: number; pan: { x: number; y: number } };
}

const BUILDINGS: BuildingHotspot[] = [
  // FCI
  {
    buildingId: "31",
    unitId: "fci",
    name: "Prédio 31 — Faculdade de Computação e Informática (FCI)",
    polygon: "1308,628 1338,618 1365,624 1418,628 1432,715 1392,730 1355,738 1305,718",
    pin: { x: 1368, y: 675 },
    focusView: { zoom: 2.3, pan: { x: -160, y: -40 } },
  },
  // CCBS (Prédios 38 e 50)
  {
    buildingId: "38",
    unitId: "ccbs",
    name: "Prédio 38 — CCBS (Laboratórios / Nutrição)",
    polygon: "1470,870 1575,860 1590,940 1480,955",
    pin: { x: 1532, y: 885 },
    focusView: { zoom: 2.2, pan: { x: -320, y: -240 } },
  },
  {
    buildingId: "50",
    unitId: "ccbs",
    name: "Prédio 50 — Centro de Ciências Biológicas e da Saúde (CCBS)",
    polygon: "735,765 860,785 855,870 730,850",
    pin: { x: 798, y: 808 },
    focusView: { zoom: 2.2, pan: { x: 400, y: -200 } },
  },
  // FDIR (Prédios 3 e 24)
  {
    buildingId: "3",
    unitId: "fdir",
    name: "Prédio 3 — Faculdade de Direito (Ed. João Calvino)",
    polygon: "1355,230 1415,220 1440,275 1390,310 1360,260",
    pin: { x: 1405, y: 240 },
    focusView: { zoom: 2.2, pan: { x: -200, y: 350 } },
  },
  {
    buildingId: "24",
    unitId: "fdir",
    name: "Prédio 24 — Faculdade de Direito (Escola Americana)",
    polygon: "1360,508 1506,510 1518,595 1375,595",
    pin: { x: 1408, y: 536 },
    focusView: { zoom: 2.2, pan: { x: -200, y: 80 } },
  },
  // CCL (Prédios 48 e 49)
  {
    buildingId: "48",
    unitId: "ccl",
    name: "Prédio 48 — Centro de Comunicação e Letras (CCL)",
    polygon: "500,470 560,450 580,560 520,580",
    pin: { x: 545, y: 525 },
    focusView: { zoom: 2.2, pan: { x: 620, y: 100 } },
  },
  {
    buildingId: "49",
    unitId: "ccl",
    name: "Prédio 49 — Centro de Comunicação e Letras (CCL)",
    polygon: "445,565 530,580 525,660 440,645",
    pin: { x: 475, y: 595 },
    focusView: { zoom: 2.2, pan: { x: 660, y: -20 } },
  },
  // EE (Prédios 6 e 16)
  {
    buildingId: "6",
    unitId: "ee",
    name: "Prédio 6 — Escola de Engenharia (Ed. Thomas Foster)",
    polygon: "1215,380 1450,385 1450,465 1215,465",
    pin: { x: 1336, y: 380 },
    focusView: { zoom: 2.2, pan: { x: -120, y: 200 } },
  },
  {
    buildingId: "16",
    unitId: "ee",
    name: "Prédio 16 — Escola de Engenharia (Ed. Derrill Hinman)",
    polygon: "850,205 905,205 905,330 850,330",
    pin: { x: 875, y: 215 },
    focusView: { zoom: 2.2, pan: { x: 300, y: 340 } },
  },
];

export function CampusMap({
  campus,
  units,
  selectedUnitId,
  onSelectUnit,
  activeLayer,
  onLayerChange,
}: CampusMapProps) {
  const [hoveredBuilding, setHoveredBuilding] = useState<BuildingHotspot | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Estados de Pan & Zoom
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const unitMap = new Map<string, AcademicUnit>();
  units.forEach((u) => unitMap.set(u.id, u));

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(Number((prev + 0.35).toFixed(2)), 3.5));
  };

  const handleZoomOut = () => {
    setZoom((prev) => {
      const next = Math.max(Number((prev - 0.35).toFixed(2)), 1);
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    onSelectUnit(null);
  };

  const handleFocusUnit = (unitId: string) => {
    const targetBuilding = BUILDINGS.find((b) => b.unitId === unitId);
    if (targetBuilding) {
      setZoom(targetBuilding.focusView.zoom);
      setPan(targetBuilding.focusView.pan);
    }
    onSelectUnit(unitId);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - pan.x,
      y: e.clientY - pan.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y,
      });
    }

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 0.2 : -0.2;
    setZoom((prev) => {
      const next = Math.min(Math.max(Number((prev + zoomFactor).toFixed(2)), 1), 3.5);
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  const getBuildingColors = (b: BuildingHotspot) => {
    const unit = unitMap.get(b.unitId);
    const isSelected = selectedUnitId === b.unitId;
    const isHovered = hoveredBuilding?.buildingId === b.buildingId;
    const isSuppressed = unit?.metrics.suppressed ?? false;

    if (isSuppressed) {
      return {
        fill: isSelected
          ? "rgba(100, 116, 139, 0.45)"
          : isHovered
          ? "rgba(100, 116, 139, 0.35)"
          : "rgba(100, 116, 139, 0.20)",
        stroke: isSelected ? "#475569" : "#64748b",
        strokeWidth: isSelected ? 6 : isHovered ? 4 : 2,
        pinBg: isSelected ? "#475569" : "#64748b",
        isSuppressed: true,
      };
    }

    // Ativo (FCI ou CCBS)
    if (activeLayer === "sample") {
      const fillOpacity = b.unitId === "fci" ? 0.45 : 0.35;
      return {
        fill: isSelected
          ? "rgba(153, 27, 27, 0.55)"
          : isHovered
          ? "rgba(153, 27, 27, 0.35)"
          : `rgba(15, 23, 42, ${fillOpacity})`,
        stroke: isSelected ? "#991b1b" : "#0f172a",
        strokeWidth: isSelected ? 7 : isHovered ? 5 : 3,
        pinBg: isSelected ? "#991b1b" : "#1e293b",
        isSuppressed: false,
      };
    }

    if (activeLayer === "mean") {
      const meanVal = unit?.metrics.mean ?? 10;
      const strokeColor = meanVal >= 10 ? "#991b1b" : "#b45309";
      return {
        fill: isSelected
          ? "rgba(153, 27, 27, 0.55)"
          : isHovered
          ? "rgba(153, 27, 27, 0.35)"
          : meanVal >= 10
          ? "rgba(153, 27, 27, 0.30)"
          : "rgba(180, 83, 9, 0.30)",
        stroke: isSelected ? "#991b1b" : strokeColor,
        strokeWidth: isSelected ? 7 : isHovered ? 5 : 3,
        pinBg: isSelected ? "#991b1b" : strokeColor,
        isSuppressed: false,
      };
    }

    if (activeLayer === "moderate_severe" || activeLayer === "grave") {
      return {
        fill: isSelected
          ? "rgba(194, 65, 12, 0.55)"
          : isHovered
          ? "rgba(194, 65, 12, 0.35)"
          : "rgba(234, 88, 12, 0.30)",
        stroke: isSelected ? "#c2410c" : "#ea580c",
        strokeWidth: isSelected ? 7 : isHovered ? 5 : 3,
        pinBg: isSelected ? "#c2410c" : "#ea580c",
        isSuppressed: false,
      };
    }

    return {
      fill: isSelected
        ? "rgba(153, 27, 27, 0.55)"
        : isHovered
        ? "rgba(153, 27, 27, 0.35)"
        : "rgba(153, 27, 27, 0.25)",
      stroke: isSelected ? "#991b1b" : "#b91c1c",
      strokeWidth: isSelected ? 7 : isHovered ? 5 : 3,
      pinBg: isSelected ? "#991b1b" : "#b91c1c",
      isSuppressed: false,
    };
  };

  const hoveredUnit = hoveredBuilding ? unitMap.get(hoveredBuilding.unitId) : null;

  return (
    <div className="relative w-full rounded-md border border-gray-200 bg-white p-3 sm:p-5 shadow-xs space-y-3">
      {/* Barra Superior: Identificação do Campus e Seletor de Camada */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100 text-xs">
        <div className="flex items-center gap-2 text-gray-800 font-bold">
          <span className="w-2.5 h-2.5 rounded-full bg-[#EB0029]"></span>
          <span className="tracking-tight uppercase text-xs">{campus?.name ?? "Campus Higienópolis"} (UPM)</span>
        </div>

        {/* Seletor de Camada do Mapa */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded border border-gray-200">
          <span className="text-[11px] font-medium text-gray-500 px-1.5 hidden sm:inline">Camada:</span>
          {(
            [
              { id: "sample", label: "Amostra (n)" },
              { id: "mean", label: "GAD-7 Médio" },
              { id: "moderate_severe", label: "% Moderada/Grave" },
              { id: "grave", label: "% Grave" },
            ] as const
          ).map((layer) => (
            <button
              key={layer.id}
              type="button"
              onClick={() => onLayerChange(layer.id)}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                activeLayer === layer.id
                  ? "bg-white text-gray-900 shadow-xs border border-gray-200"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {layer.label}
            </button>
          ))}
        </div>
      </div>

      {/* Viewport do Mapa com Pan & Zoom */}
      <div
        ref={containerRef}
        className={`relative w-full overflow-hidden rounded-xl border border-slate-300 shadow-inner bg-slate-100 select-none ${
          isDragging ? "cursor-grabbing" : zoom > 1 ? "cursor-grab" : "cursor-default"
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          handleMouseUp();
          setHoveredBuilding(null);
          setTooltipPos(null);
        }}
        onWheel={handleWheel}
        style={{ touchAction: "none" }}
      >
        {/* Painel Flutuante de Controles Acessíveis */}
        <div className="absolute top-3 right-3 z-20 flex flex-col items-center bg-white rounded border border-gray-300 p-1 space-y-1 shadow-sm">
          <button
            type="button"
            onClick={handleZoomIn}
            aria-label="Aproximar mapa"
            title="Aproximar (+)"
            className="w-8 h-8 flex items-center justify-center rounded text-gray-700 hover:text-[#EB0029] hover:bg-gray-100 transition-colors focus:outline-none"
          >
            <IconZoomIn className="w-4 h-4" />
          </button>

          <div className="text-[10px] font-bold text-gray-600 py-0.5 select-none font-mono">
            {Math.round(zoom * 100)}%
          </div>

          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoom <= 1}
            aria-label="Afastar mapa"
            title="Afastar (-)"
            className="w-8 h-8 flex items-center justify-center rounded text-gray-700 hover:text-[#EB0029] hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none transition-colors focus:outline-none"
          >
            <IconZoomOut className="w-4 h-4" />
          </button>

          <div className="w-5 h-[1px] bg-gray-200 my-0.5"></div>

          <button
            type="button"
            onClick={handleResetView}
            aria-label="Restaurar visão geral"
            title="Visão Geral do Campus"
            className="w-8 h-8 flex items-center justify-center rounded text-gray-600 hover:text-[#EB0029] hover:bg-gray-100 transition-colors focus:outline-none"
          >
            <IconReset className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Camada Transformável com Pan & Zoom */}
        <div
          className="w-full relative transition-transform duration-75 ease-out origin-center"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          }}
        >
          <img
            src={campus?.image ?? "/campus/mapa-oficial-higienopolis.webp"}
            alt="Mapa Oficial do Campus Higienópolis"
            width={campus?.dimensions.width ?? 2480}
            height={campus?.dimensions.height ?? 1526}
            className="w-full h-auto block select-none pointer-events-none"
            loading="eager"
            draggable={false}
          />

          <svg
            viewBox="0 0 2480 1526"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full pointer-events-auto"
            role="region"
            aria-label="Camada de hotspots espaciais das faculdades do Mackenzie"
          >
            <defs>
              <filter id="active-glow-red" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="16" floodColor="#991b1b" floodOpacity="0.85" />
              </filter>
              <filter id="active-glow-slate" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="12" floodColor="#475569" floodOpacity="0.75" />
              </filter>
              <pattern id="suppressed-hatch" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="20" stroke="#64748b" strokeWidth="4" />
              </pattern>
            </defs>

            {/* Mapeamento de Todos os Prédios com Hotspots Oficiais */}
            {BUILDINGS.map((b) => {
              const colors = getBuildingColors(b);
              const isSelected = selectedUnitId === b.unitId;

              return (
                <g
                  key={b.buildingId}
                  id={`hotspot-building-${b.buildingId}`}
                  data-building-id={b.buildingId}
                  data-unit-id={b.unitId}
                  role="button"
                  tabIndex={0}
                  aria-label={b.name}
                  aria-pressed={isSelected}
                  className="cursor-pointer outline-none transition-all duration-150"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectUnit(isSelected ? null : b.unitId);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectUnit(isSelected ? null : b.unitId);
                    }
                  }}
                  onMouseEnter={() => setHoveredBuilding(b)}
                  onMouseLeave={() => setHoveredBuilding(null)}
                >
                  <polygon
                    points={b.polygon}
                    fill={colors.fill}
                    stroke={colors.stroke}
                    strokeWidth={colors.strokeWidth}
                    strokeLinejoin="round"
                    filter={
                      isSelected
                        ? colors.isSuppressed
                          ? "url(#active-glow-slate)"
                          : "url(#active-glow-red)"
                        : undefined
                    }
                    className="transition-all duration-200"
                  />

                  {/* Marcador Discreto com Número Oficial do Prédio */}
                  <g transform={`translate(${b.pin.x}, ${b.pin.y})`}>
                    <circle
                      cx="0"
                      cy="0"
                      r={isSelected ? 26 : 20}
                      fill={colors.pinBg}
                      stroke="#ffffff"
                      strokeWidth="3.5"
                      className={isSelected ? "animate-pulse" : ""}
                    />
                    <text
                      x="0"
                      y="6"
                      fill="#ffffff"
                      fontSize={isSelected ? "16" : "13"}
                      fontWeight="900"
                      textAnchor="middle"
                      className="select-none pointer-events-none"
                    >
                      {b.buildingId}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Tooltip Dinâmico Limpo */}
        {hoveredBuilding && tooltipPos && (
          <div
            className="absolute z-30 pointer-events-none bg-slate-900/95 text-white backdrop-blur px-3 py-2 rounded-xl text-xs shadow-2xl border border-slate-700 space-y-1 transition-opacity duration-150"
            style={{
              left: Math.min(tooltipPos.x + 15, (containerRef.current?.clientWidth ?? 800) - 260),
              top: Math.max(tooltipPos.y - 75, 15),
            }}
          >
            <div className="font-bold text-red-400">
              {hoveredBuilding.name}
            </div>
            {hoveredUnit && (
              <>
                <div className="text-[11px] text-slate-300">
                  Amostra: <strong className="text-white font-bold">{hoveredUnit.metrics.n}</strong> estudantes
                </div>
                {hoveredUnit.metrics.suppressed ? (
                  <div className="text-[11px] text-amber-300 font-medium">
                    ⚠️ Amostra insuficiente (n &lt; 10) • Dados suprimidos por privacidade
                  </div>
                ) : (
                  <div className="text-[11px] text-emerald-400 font-semibold">
                    GAD-7 Médio: {hoveredUnit.metrics.mean} • Clique para filtrar
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Barra de Seleção Rápida de Unidades Acadêmicas */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-gray-500 mr-1 flex items-center gap-1 uppercase tracking-wider">
            <IconBuilding className="w-3.5 h-3.5 text-[#EB0029]" />
            Unidades:
          </span>

          <button
            type="button"
            onClick={handleResetView}
            className={`px-3 py-1 rounded text-xs font-semibold transition-all border ${
              selectedUnitId === null
                ? "bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-xs"
                : "bg-white hover:bg-gray-100 text-gray-700 border-gray-300"
            }`}
          >
            Campus Geral
          </button>

          <button
            type="button"
            onClick={() => handleFocusUnit("fci")}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all border ${
              selectedUnitId === "fci"
                ? "bg-[#EB0029] text-white border-[#EB0029] shadow-xs"
                : "bg-white hover:bg-red-50 text-[#EB0029] border-red-200"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#EB0029]"></span>
            FCI (Prédio 31)
            <span className="text-[10px] opacity-80">(n=171)</span>
          </button>

          <button
            type="button"
            onClick={() => handleFocusUnit("ccbs")}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all border ${
              selectedUnitId === "ccbs"
                ? "bg-emerald-800 text-white border-emerald-800 shadow-xs"
                : "bg-white hover:bg-emerald-50 text-emerald-800 border-emerald-200"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            CCBS (Prédios 38/50)
            <span className="text-[10px] opacity-80">(n=11)</span>
          </button>

          <button
            type="button"
            onClick={() => handleFocusUnit("fdir")}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all border ${
              selectedUnitId === "fdir"
                ? "bg-gray-700 text-white border-gray-700 shadow-xs"
                : "bg-white hover:bg-gray-100 text-gray-600 border-gray-300"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
            FDIR (Prédios 3/24)
            <span className="text-[10px] text-amber-700 font-bold">(n=7)</span>
          </button>

          <button
            type="button"
            onClick={() => handleFocusUnit("ccl")}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all border ${
              selectedUnitId === "ccl"
                ? "bg-gray-700 text-white border-gray-700 shadow-xs"
                : "bg-white hover:bg-gray-100 text-gray-600 border-gray-300"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
            CCL (Prédios 48/49)
            <span className="text-[10px] text-amber-700 font-bold">(n=2)</span>
          </button>

          <button
            type="button"
            onClick={() => handleFocusUnit("ee")}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all border ${
              selectedUnitId === "ee"
                ? "bg-gray-700 text-white border-gray-700 shadow-xs"
                : "bg-white hover:bg-gray-100 text-gray-600 border-gray-300"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
            EE (Prédios 6/16)
            <span className="text-[10px] text-amber-700 font-bold">(n=1)</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-400">
          Clique no prédio ou no botão para focar e filtrar
        </div>
      </div>
    </div>
  );
}
