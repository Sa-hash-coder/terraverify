"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { TreePine } from "lucide-react";
import { Panel } from "../shared/design-system";

export interface ForestAsset {
  id: number;
  name: string;
  shortName: string;
  region: string;
  grade: "AAA" | "AA" | "A" | "B" | "C";
  ndvi: number;
  basePrice: number;
  currentPrice: number;
  change24h: number;
  carbonApy: number; // Annual carbon credit return yield %
  carbonRate: number; // tCO2e sequestered per hectare/yr
  monthlyOutput: number; // tCO2e/month per 100t
  status: "Verified" | "Suspended";
}

export const FORESTS: ForestAsset[] = [
  {
    id: 1,
    name: "Amazon Reforestation Block 7",
    shortName: "Amazon Block 7",
    region: "Amazonas, Brazil",
    grade: "AAA",
    ndvi: 0.845,
    basePrice: 0.15,
    currentPrice: 0.154,
    change24h: 5.48,
    carbonApy: 14.8,
    carbonRate: 24.5,
    monthlyOutput: 20.4,
    status: "Verified",
  },
  {
    id: 2,
    name: "Congo Basin Conservation",
    shortName: "Congo Basin",
    region: "Équateur, DRC",
    grade: "AA",
    ndvi: 0.812,
    basePrice: 0.12,
    currentPrice: 0.122,
    change24h: 2.14,
    carbonApy: 12.2,
    carbonRate: 19.8,
    monthlyOutput: 16.5,
    status: "Verified",
  },
  {
    id: 5,
    name: "Sumatra Tiger Reserve",
    shortName: "Sumatra Reserve",
    region: "Sumatra, Indonesia",
    grade: "A",
    ndvi: 0.76,
    basePrice: 0.08,
    currentPrice: 0.079,
    change24h: -1.25,
    carbonApy: 9.6,
    carbonRate: 15.2,
    monthlyOutput: 12.7,
    status: "Verified",
  },
  {
    id: 4,
    name: "Borneo Peatland Protection",
    shortName: "Borneo Peatland",
    region: "Central Kalimantan, ID",
    grade: "C",
    ndvi: 0.584,
    basePrice: 0.05,
    currentPrice: 0.048,
    change24h: -6.42,
    carbonApy: 4.1,
    carbonRate: 6.4,
    monthlyOutput: 5.3,
    status: "Suspended",
  },
  {
    id: 6,
    name: "Valdivian Temperate Rainforest",
    shortName: "Valdivian Forest",
    region: "Los Ríos, Chile",
    grade: "AAA",
    ndvi: 0.862,
    basePrice: 0.18,
    currentPrice: 0.186,
    change24h: 6.89,
    carbonApy: 16.4,
    carbonRate: 28.0,
    monthlyOutput: 23.3,
    status: "Verified",
  },
];

interface DataPoint {
  time: string;
  fullDate: string;
  price: number;
  carbonYield: number; // % APY
  carbonCredits: number; // tCO2e / mo
  ndvi: number;
}

type Timeframe = "24H" | "7D" | "30D" | "1Y";

interface ForestMarketSimulationProps {
  selectedListingId?: number;
  onSelectForest?: (forestId: number) => void;
  className?: string;
}

function generateInitialSeries(forest: ForestAsset, timeframe: Timeframe): DataPoint[] {
  const pointsCount = timeframe === "24H" ? 32 : timeframe === "7D" ? 32 : timeframe === "30D" ? 32 : 36;
  const now = Date.now();
  const stepMs =
    timeframe === "24H"
      ? (24 * 60 * 60 * 1000) / pointsCount
      : timeframe === "7D"
      ? (7 * 24 * 60 * 60 * 1000) / pointsCount
      : timeframe === "30D"
      ? (30 * 24 * 60 * 60 * 1000) / pointsCount
      : (365 * 24 * 60 * 60 * 1000) / pointsCount;

  let currentPrice = forest.basePrice * (1 - (forest.change24h / 100) * 0.7);
  let currentYield = forest.carbonApy * 0.94;
  const result: DataPoint[] = [];

  for (let i = 0; i < pointsCount; i++) {
    const t = now - (pointsCount - 1 - i) * stepMs;
    const dateObj = new Date(t);
    const timeLabel =
      timeframe === "24H"
        ? dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : dateObj.toLocaleDateString([], { month: "short", day: "numeric" });
    const fullDate = dateObj.toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const progress = i / (pointsCount - 1);
    const targetPrice = forest.currentPrice;
    const randomWave =
      Math.sin(i * 1.6 + forest.id * 2) * (forest.basePrice * 0.035) +
      Math.cos(i * 0.85) * (forest.basePrice * 0.02);

    currentPrice = currentPrice * (1 - progress * 0.05) + targetPrice * (progress * 0.05) + randomWave * 0.3;
    if (i === pointsCount - 1) currentPrice = forest.currentPrice;

    currentYield = forest.carbonApy + Math.sin(i * 0.75 + forest.id) * 0.6;
    const ndviPoint = Number((forest.ndvi + Math.sin(i * 0.5) * 0.008).toFixed(3));
    const credits = Number((forest.monthlyOutput * (currentPrice / forest.basePrice)).toFixed(1));

    result.push({
      time: timeLabel,
      fullDate,
      price: Math.max(0.01, Number(currentPrice.toFixed(4))),
      carbonYield: Number(currentYield.toFixed(2)),
      carbonCredits: credits,
      ndvi: ndviPoint,
    });
  }

  return result;
}

export default function ForestMarketSimulation({
  selectedListingId = 1,
  onSelectForest,
  className = "",
}: ForestMarketSimulationProps) {
  const [selectedForestId, setSelectedForestId] = useState<number>(selectedListingId || 1);
  const [timeframe, setTimeframe] = useState<Timeframe>("24H");

  // Hover state for interactive inspection
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [hoverCoords, setHoverCoords] = useState<{ x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (selectedListingId && FORESTS.some((f) => f.id === selectedListingId)) {
      setSelectedForestId(selectedListingId);
    }
  }, [selectedListingId]);

  const activeForest = useMemo(
    () => FORESTS.find((f) => f.id === selectedForestId) || FORESTS[0],
    [selectedForestId]
  );

  const [seriesData, setSeriesData] = useState<DataPoint[]>(() =>
    generateInitialSeries(activeForest, timeframe)
  );

  useEffect(() => {
    setSeriesData(generateInitialSeries(activeForest, timeframe));
    setHoverIndex(null);
  }, [activeForest.id, timeframe]);

  // Subtle live stream update
  useEffect(() => {
    const interval = setInterval(() => {
      setSeriesData((prev) => {
        if (prev.length === 0) return prev;
        const last = prev[prev.length - 1];

        const delta = (Math.random() - 0.495) * (activeForest.basePrice * 0.007);
        const newPrice = Math.max(0.01, Number((last.price + delta).toFixed(4)));

        const yieldDelta = (Math.random() - 0.5) * 0.06;
        const newYield = Number(Math.max(2, Math.min(25, last.carbonYield + yieldDelta)).toFixed(2));

        const now = Date.now();
        const dateObj = new Date(now);
        const timeLabel = dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const fullDate = dateObj.toLocaleString([], {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        const newPoint: DataPoint = {
          time: timeLabel,
          fullDate,
          price: newPrice,
          carbonYield: newYield,
          carbonCredits: Number((activeForest.monthlyOutput * (newPrice / activeForest.basePrice)).toFixed(1)),
          ndvi: activeForest.ndvi,
        };

        return [...prev.slice(1), newPoint];
      });
    }, 3500);

    return () => clearInterval(interval);
  }, [activeForest.id, activeForest.basePrice, activeForest.monthlyOutput, activeForest.ndvi]);

  // SVG coordinates calculation
  const chartPoints = useMemo(() => {
    if (!seriesData || seriesData.length === 0) return [];

    const prices = seriesData.map((d) => d.price);
    const yields = seriesData.map((d) => d.carbonYield);

    const minPrice = Math.min(...prices) * 0.992;
    const maxPrice = Math.max(...prices) * 1.008;
    const priceRange = maxPrice - minPrice || 1;

    const minYield = Math.min(...yields) * 0.98;
    const maxYield = Math.max(...yields) * 1.02;
    const yieldRange = maxYield - minYield || 1;

    const svgWidth = 720;
    const svgHeight = 220;
    const padding = { top: 16, bottom: 24, left: 12, right: 12 };
    const chartW = svgWidth - padding.left - padding.right;
    const chartH = svgHeight - padding.top - padding.bottom;

    return seriesData.map((d, index) => {
      const x = padding.left + (index / (seriesData.length - 1)) * chartW;
      const yPrice = padding.top + chartH - ((d.price - minPrice) / priceRange) * chartH;
      const yYield = padding.top + chartH - ((d.carbonYield - minYield) / yieldRange) * chartH;
      return {
        ...d,
        x,
        yPrice,
        yYield,
        chartH,
        padding,
      };
    });
  }, [seriesData]);

  const { pricePath, priceAreaPath, yieldPath, yieldAreaPath } = useMemo(() => {
    if (chartPoints.length < 2) {
      return { pricePath: "", priceAreaPath: "", yieldPath: "", yieldAreaPath: "" };
    }

    const first = chartPoints[0];
    const last = chartPoints[chartPoints.length - 1];
    const baselineY = first.padding.top + first.chartH;

    // Price path
    let pPath = `M ${first.x} ${first.yPrice}`;
    for (let i = 1; i < chartPoints.length; i++) {
      const curr = chartPoints[i];
      const prev = chartPoints[i - 1];
      const cx = (prev.x + curr.x) / 2;
      pPath += ` C ${cx} ${prev.yPrice}, ${cx} ${curr.yPrice}, ${curr.x} ${curr.yPrice}`;
    }
    const pArea = `${pPath} L ${last.x} ${baselineY} L ${first.x} ${baselineY} Z`;

    // Yield path
    let yLine = `M ${first.x} ${first.yYield}`;
    for (let i = 1; i < chartPoints.length; i++) {
      const curr = chartPoints[i];
      const prev = chartPoints[i - 1];
      const cx = (prev.x + curr.x) / 2;
      yLine += ` C ${cx} ${prev.yYield}, ${cx} ${curr.yYield}, ${curr.x} ${curr.yYield}`;
    }
    const yArea = `${yLine} L ${last.x} ${baselineY} L ${first.x} ${baselineY} Z`;

    return {
      pricePath: pPath,
      priceAreaPath: pArea,
      yieldPath: yLine,
      yieldAreaPath: yArea,
    };
  }, [chartPoints]);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || chartPoints.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const scaleX = 720 / rect.width;
    const svgX = clientX * scaleX;

    let closestIdx = 0;
    let minDiff = Infinity;
    for (let i = 0; i < chartPoints.length; i++) {
      const diff = Math.abs(chartPoints[i].x - svgX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = i;
      }
    }

    setHoverIndex(closestIdx);
    setHoverCoords({ x: clientX, y: clientY });
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
    setHoverCoords(null);
  };

  const activePoint =
    hoverIndex !== null && chartPoints[hoverIndex]
      ? chartPoints[hoverIndex]
      : chartPoints[chartPoints.length - 1];

  return (
    <Panel className={`overflow-hidden border border-[#dbe3d8] bg-white shadow-xs p-4 sm:p-5 ${className}`}>
      {/* Minimal Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e1e8de]">
        {/* Forest Selector Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin">
          <TreePine className="w-3.5 h-3.5 text-[#2d6a4f] shrink-0 mr-1" />
          {FORESTS.map((f) => {
            const isSelected = f.id === activeForest.id;
            return (
              <button
                key={f.id}
                onClick={() => {
                  setSelectedForestId(f.id);
                  if (onSelectForest) onSelectForest(f.id);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-[#2d6a4f] text-white shadow-xs"
                    : "bg-[#f0f4ee] text-[#5c7366] hover:text-[#111e16] hover:bg-[#e6f4ea]"
                }`}
              >
                {f.shortName}
              </button>
            );
          })}
        </div>

        {/* Minimal Timeframe selector */}
        <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
          {(["24H", "7D", "30D", "1Y"] as Timeframe[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                timeframe === tf
                  ? "bg-[#111e16] text-white font-bold"
                  : "text-[#5c7366] hover:text-[#111e16] hover:bg-[#f0f4ee]"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Graph Section with interactive hover details */}
      <div className="relative pt-3 select-none">
        {/* Subtle Line Legends & Hover Hint */}
        <div className="flex items-center justify-between text-xs mb-2 text-[#5c7366]">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-[#2d6a4f] inline-block rounded-full" />
              <span className="font-medium text-[#111e16]">Ongoing Forest Price</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-[#0284c7] inline-block rounded-full" />
              <span className="font-medium text-[#111e16]">Carbon Credit Yield</span>
            </div>
          </div>
          <span className="text-[11px] text-[#5c7366]/80 hidden sm:inline">
            Hover lines for details
          </span>
        </div>

        {/* Minimalist SVG Canvas */}
        <div className="relative w-full bg-[#f9fbf8] rounded-xl border border-[#dbe3d8] p-1.5 overflow-hidden">
          <svg
            ref={svgRef}
            viewBox="0 0 720 220"
            className="w-full h-56 sm:h-64 overflow-visible cursor-crosshair"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <defs>
              <linearGradient id="minPriceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2d6a4f" stopOpacity="0.22" />
                <stop offset="90%" stopColor="#2d6a4f" stopOpacity="0.01" />
                <stop offset="100%" stopColor="#2d6a4f" stopOpacity="0.0" />
              </linearGradient>

              <linearGradient id="minYieldGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.18" />
                <stop offset="90%" stopColor="#0284c7" stopOpacity="0.01" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Subtle Horizon Guidelines */}
            {[50, 100, 150].map((y) => (
              <line
                key={y}
                x1="12"
                y1={y}
                x2="708"
                y2={y}
                stroke="#e8efe6"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            ))}

            {/* Price Area & Line */}
            {priceAreaPath && (
              <>
                <path d={priceAreaPath} fill="url(#minPriceGrad)" />
                <path
                  d={pricePath}
                  fill="none"
                  stroke="#2d6a4f"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </>
            )}

            {/* Yield Area & Line */}
            {yieldAreaPath && (
              <>
                <path d={yieldAreaPath} fill="url(#minYieldGrad)" />
                <path
                  d={yieldPath}
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </>
            )}

            {/* Interactive Crosshair & Cursor Points */}
            {hoverIndex !== null && chartPoints[hoverIndex] && (
              <g>
                <line
                  x1={chartPoints[hoverIndex].x}
                  y1="16"
                  x2={chartPoints[hoverIndex].x}
                  y2="196"
                  stroke="#5c7366"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                {/* Point on Price line */}
                <circle
                  cx={chartPoints[hoverIndex].x}
                  cy={chartPoints[hoverIndex].yPrice}
                  r="5"
                  fill="#ffffff"
                  stroke="#2d6a4f"
                  strokeWidth="3"
                />
                {/* Point on Yield line */}
                <circle
                  cx={chartPoints[hoverIndex].x}
                  cy={chartPoints[hoverIndex].yYield}
                  r="4.5"
                  fill="#ffffff"
                  stroke="#0284c7"
                  strokeWidth="2.5"
                />
              </g>
            )}

            {/* Simple Timeline Markers */}
            {chartPoints
              .filter((_, idx) => idx % Math.ceil(chartPoints.length / 5) === 0 || idx === chartPoints.length - 1)
              .map((pt, idx) => (
                <text
                  key={idx}
                  x={pt.x}
                  y="212"
                  textAnchor="middle"
                  fill="#7a9484"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {pt.time}
                </text>
              ))}
          </svg>

          {/* Floating Detail Tooltip on Hover */}
          {hoverIndex !== null && activePoint && hoverCoords && (
            <div
              className="absolute z-20 pointer-events-none bg-[#111e16] text-white p-3 rounded-xl shadow-xl text-xs font-mono space-y-1.5 min-w-[210px] border border-white/10"
              style={{
                left: Math.min(Math.max(hoverCoords.x - 105, 12), (svgRef.current?.clientWidth || 300) - 225),
                top: Math.max(hoverCoords.y - 130, 8),
              }}
            >
              <div className="flex items-center justify-between text-[11px] text-[#a3cfbb] border-b border-white/10 pb-1">
                <span>{activePoint.fullDate}</span>
                <span className="font-bold text-white">{activeForest.shortName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#a3cfbb]">Forest Price:</span>
                <span className="font-bold text-[#4ade80]">{activePoint.price.toFixed(3)} SOL/t</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#a3cfbb]">Carbon Credit Yield:</span>
                <span className="font-bold text-[#38bdf8]">+{activePoint.carbonYield.toFixed(1)}% APY</span>
              </div>
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/10">
                <span className="text-white/60">Monthly Output:</span>
                <span className="text-white font-medium">~{activePoint.carbonCredits} tCO2e</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-white/60">Biomass NDVI:</span>
                <span className="text-white font-medium">{activePoint.ndvi} ({activeForest.grade})</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
}
