"use client";

import { useState } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  LineChart,
  BarChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-media-query";
import { useChartZoom } from "@/hooks/use-chart-zoom";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ChartDataPoint {
  timestamp: number;
  date: string;
  fullDate: string;
  weight: number;
  circumference: number | null;
}

interface ChartReportProps {
  data: ChartDataPoint[];
}

type ChartMode = "combo" | "distinct";
type TimeRange = "1m" | "2m" | "5m" | "12m" | "max";

const TIME_RANGES: { key: TimeRange; label: string; months: number | null }[] = [
  { key: "1m", label: "1H", months: 1 },
  { key: "2m", label: "2H", months: 2 },
  { key: "5m", label: "5H", months: 5 },
  { key: "12m", label: "12H", months: 12 },
  { key: "max", label: "MAX", months: null },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTick(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("hu-HU", {
    month: "short",
    day: "numeric",
  });
}

/** Filter data to show only the last N months from the latest entry. */
function filterByTimeRange(
  data: ChartDataPoint[],
  range: TimeRange,
): ChartDataPoint[] {
  if (range === "max" || data.length === 0) return data;

  const months = TIME_RANGES.find((r) => r.key === range)?.months;
  if (months == null) return data;

  const latest = new Date(data[data.length - 1].timestamp);
  const cutoff = new Date(latest);
  cutoff.setMonth(cutoff.getMonth() - months);
  const cutoffTs = cutoff.getTime();

  return data.filter((d) => d.timestamp >= cutoffTs);
}

/** Get the [min, max] timestamp range from a data array. */
function getDataRange(data: ChartDataPoint[]): [number, number] {
  if (data.length === 0) return [0, 1];
  return [data[0].timestamp, data[data.length - 1].timestamp];
}

// ---------------------------------------------------------------------------
// Custom Tooltip
// ---------------------------------------------------------------------------

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    payload: ChartDataPoint;
  }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  const fullDate = payload[0]?.payload?.fullDate ?? label;

  return (
    <div className="rounded-lg border bg-card p-3 shadow-md">
      <p className="text-sm font-medium mb-1">{fullDate}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm" style={{ color: entry.color }}>
          {entry.name}:{" "}
          <span className="font-semibold">{entry.value?.toFixed(1)}</span>
          {entry.name === "Tests\u00faly" ? " kg" : " cm"}
        </p>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Zoom Reset Overlay
// ---------------------------------------------------------------------------

function ZoomResetButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="absolute top-2 right-2 z-10 flex items-center gap-1.5 rounded-full
        bg-muted/80 backdrop-blur-sm px-3 py-1.5 text-xs font-medium
        text-muted-foreground shadow-sm border border-border/50
        transition-all hover:bg-muted hover:text-foreground hover:shadow-md
        active:scale-95"
      aria-label="Nagyítás visszaállítása"
    >
      <RotateCcw className="h-3 w-3" />
      Visszaállítás
    </button>
  );
}

// ---------------------------------------------------------------------------
// Chart wrapper — edge-to-edge on mobile
// ---------------------------------------------------------------------------

function ChartCard({
  title,
  children,
  isZoomed,
  onResetZoom,
}: {
  title: string;
  children: React.ReactNode;
  isZoomed: boolean;
  onResetZoom: () => void;
}) {
  return (
    <div className="-mx-4 md:mx-0">
      <Card className="rounded-none md:rounded-lg border-x-0 md:border-x">
        <CardHeader className="pb-2 px-4 md:px-6">
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent className="relative px-0 md:px-6">
          {isZoomed ? <ZoomResetButton onClick={onResetZoom} /> : null}
          {children}
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Combo Chart (Weight bars + Circumference line, dual Y-axes)
// ---------------------------------------------------------------------------

function ComboChart({ data }: { data: ChartDataPoint[] }) {
  const isMobile = useIsMobile();
  const dataRange = getDataRange(data);
  const zoom = useChartZoom(dataRange);

  // Derive visible data based on zoom (computed during render, no useEffect)
  const visibleData =
    zoom.zoomDomain != null
      ? data.filter(
          (d) =>
            d.timestamp >= zoom.zoomDomain![0] &&
            d.timestamp <= zoom.zoomDomain![1],
        )
      : data;

  const weights = visibleData.map((d) => d.weight);
  const circumferences = visibleData
    .map((d) => d.circumference)
    .filter((v): v is number => v != null);

  const weightMin = Math.floor(Math.min(...weights) - 2);
  const weightMax = Math.ceil(Math.max(...weights) + 2);
  const circumMin = circumferences.length
    ? Math.floor(Math.min(...circumferences) - 5)
    : 0;
  const circumMax = circumferences.length
    ? Math.ceil(Math.max(...circumferences) + 5)
    : 100;

  const xDomain: [number | string, number | string] =
    zoom.zoomDomain ?? ["dataMin", "dataMax"];

  const chartHeight = isMobile ? 260 : 350;
  const tickSize = isMobile ? 10 : 12;
  const labelSize = isMobile ? 9 : 11;
  const barWidth = isMobile ? 14 : 20;
  const margins = isMobile
    ? { top: 5, right: 8, bottom: 5, left: 4 }
    : { top: 5, right: 20, bottom: 5, left: 10 };

  return (
    <ChartCard
      title="Testsúly &amp; Körfogat"
      isZoomed={zoom.isZoomed}
      onResetZoom={zoom.resetZoom}
    >
      <ResponsiveContainer width="100%" height={chartHeight}>
        <ComposedChart
          data={data}
          margin={margins}
          onMouseDown={zoom.onMouseDown}
          onMouseMove={zoom.onMouseMove}
          onMouseUp={zoom.onMouseUp}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="timestamp"
            type="number"
            scale="time"
            domain={xDomain}
            tickFormatter={formatTick}
            tick={{ fontSize: tickSize }}
            className="fill-muted-foreground"
            allowDataOverflow
          />
          <YAxis
            yAxisId="weight"
            orientation="right"
            domain={[weightMin, weightMax]}
            tick={{ fontSize: tickSize }}
            className="fill-muted-foreground"
            unit=" kg"
            width={isMobile ? 45 : 60}
            label={
              isMobile
                ? undefined
                : {
                    value: "Testsúly (kg)",
                    angle: 90,
                    position: "insideRight",
                    offset: 10,
                    style: {
                      fontSize: labelSize,
                      fill: "oklch(0.7 0.12 340)",
                    },
                  }
            }
          />
          <YAxis
            yAxisId="circumference"
            orientation="left"
            domain={[circumMin, circumMax]}
            tick={{ fontSize: tickSize }}
            className="fill-muted-foreground"
            unit=" cm"
            width={isMobile ? 45 : 60}
            label={
              isMobile
                ? undefined
                : {
                    value: "Körfogat (cm)",
                    angle: -90,
                    position: "insideLeft",
                    offset: -2,
                    style: {
                      fontSize: labelSize,
                      fill: "oklch(0.65 0.1 300)",
                    },
                  }
            }
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            yAxisId="weight"
            dataKey="weight"
            name="Testsúly"
            fill="oklch(0.7 0.12 340)"
            opacity={0.7}
            radius={[4, 4, 0, 0]}
            barSize={barWidth}
          />
          <Line
            yAxisId="circumference"
            dataKey="circumference"
            name="Körfogat"
            stroke="oklch(0.65 0.1 300)"
            strokeWidth={2}
            dot={{ r: isMobile ? 3 : 4, fill: "oklch(0.65 0.1 300)", strokeWidth: 0 }}
            activeDot={{ r: isMobile ? 5 : 6 }}
            connectNulls
          />
          {zoom.refAreaLeft != null && zoom.refAreaRight != null ? (
            <ReferenceArea
              yAxisId="weight"
              x1={zoom.refAreaLeft}
              x2={zoom.refAreaRight}
              strokeOpacity={0.3}
              fill="oklch(0.7 0.12 340)"
              fillOpacity={0.15}
            />
          ) : null}
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// ---------------------------------------------------------------------------
// Weight Chart (standalone bars)
// ---------------------------------------------------------------------------

function WeightChart({ data }: { data: ChartDataPoint[] }) {
  const isMobile = useIsMobile();
  const dataRange = getDataRange(data);
  const zoom = useChartZoom(dataRange);

  const visibleData =
    zoom.zoomDomain != null
      ? data.filter(
          (d) =>
            d.timestamp >= zoom.zoomDomain![0] &&
            d.timestamp <= zoom.zoomDomain![1],
        )
      : data;

  const weights = visibleData.map((d) => d.weight);
  const weightMin = Math.floor(Math.min(...weights) - 2);
  const weightMax = Math.ceil(Math.max(...weights) + 2);

  const xDomain: [number | string, number | string] =
    zoom.zoomDomain ?? ["dataMin", "dataMax"];

  const chartHeight = isMobile ? 220 : 280;
  const tickSize = isMobile ? 10 : 12;
  const barWidth = isMobile ? 18 : 24;
  const margins = isMobile
    ? { top: 5, right: 8, bottom: 5, left: -10 }
    : { top: 5, right: 10, bottom: 5, left: -10 };

  return (
    <ChartCard
      title="Testsúly (kg)"
      isZoomed={zoom.isZoomed}
      onResetZoom={zoom.resetZoom}
    >
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={data}
          margin={margins}
          onMouseDown={zoom.onMouseDown}
          onMouseMove={zoom.onMouseMove}
          onMouseUp={zoom.onMouseUp}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="timestamp"
            type="number"
            scale="time"
            domain={xDomain}
            tickFormatter={formatTick}
            tick={{ fontSize: tickSize }}
            className="fill-muted-foreground"
            allowDataOverflow
          />
          <YAxis
            domain={[weightMin, weightMax]}
            tick={{ fontSize: tickSize }}
            className="fill-muted-foreground"
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="weight"
            name="Testsúly"
            fill="oklch(0.7 0.12 340)"
            opacity={0.8}
            radius={[4, 4, 0, 0]}
            barSize={barWidth}
          />
          {zoom.refAreaLeft != null && zoom.refAreaRight != null ? (
            <ReferenceArea
              x1={zoom.refAreaLeft}
              x2={zoom.refAreaRight}
              strokeOpacity={0.3}
              fill="oklch(0.7 0.12 340)"
              fillOpacity={0.15}
            />
          ) : null}
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// ---------------------------------------------------------------------------
// Circumference Chart (standalone line)
// ---------------------------------------------------------------------------

function CircumferenceChart({ data }: { data: ChartDataPoint[] }) {
  const isMobile = useIsMobile();
  const dataRange = getDataRange(data);
  const zoom = useChartZoom(dataRange);

  const circumferences = data
    .map((d) => d.circumference)
    .filter((v): v is number => v != null);

  if (circumferences.length === 0) {
    return (
      <div className="-mx-4 md:mx-0">
        <Card className="rounded-none md:rounded-lg border-x-0 md:border-x">
          <CardHeader className="pb-2 px-4 md:px-6">
            <CardTitle className="text-base">Körfogat (cm)</CardTitle>
          </CardHeader>
          <CardContent className="px-4 md:px-6">
            <p className="text-muted-foreground text-center py-8 text-sm">
              Még nincs rögzített körfogat adat.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const visibleData =
    zoom.zoomDomain != null
      ? data.filter(
          (d) =>
            d.timestamp >= zoom.zoomDomain![0] &&
            d.timestamp <= zoom.zoomDomain![1],
        )
      : data;

  const visibleCircumferences = visibleData
    .map((d) => d.circumference)
    .filter((v): v is number => v != null);

  const circumMin = visibleCircumferences.length
    ? Math.floor(Math.min(...visibleCircumferences) - 5)
    : 0;
  const circumMax = visibleCircumferences.length
    ? Math.ceil(Math.max(...visibleCircumferences) + 5)
    : 100;

  const xDomain: [number | string, number | string] =
    zoom.zoomDomain ?? ["dataMin", "dataMax"];

  const chartHeight = isMobile ? 220 : 280;
  const tickSize = isMobile ? 10 : 12;
  const margins = isMobile
    ? { top: 5, right: 8, bottom: 5, left: -10 }
    : { top: 5, right: 10, bottom: 5, left: -10 };

  return (
    <ChartCard
      title="Körfogat (cm)"
      isZoomed={zoom.isZoomed}
      onResetZoom={zoom.resetZoom}
    >
      <ResponsiveContainer width="100%" height={chartHeight}>
        <LineChart
          data={data}
          margin={margins}
          onMouseDown={zoom.onMouseDown}
          onMouseMove={zoom.onMouseMove}
          onMouseUp={zoom.onMouseUp}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="timestamp"
            type="number"
            scale="time"
            domain={xDomain}
            tickFormatter={formatTick}
            tick={{ fontSize: tickSize }}
            className="fill-muted-foreground"
            allowDataOverflow
          />
          <YAxis
            domain={[circumMin, circumMax]}
            tick={{ fontSize: tickSize }}
            className="fill-muted-foreground"
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            dataKey="circumference"
            name="Körfogat"
            stroke="oklch(0.65 0.1 300)"
            strokeWidth={2}
            dot={{
              r: isMobile ? 4 : 5,
              fill: "oklch(0.65 0.1 300)",
              strokeWidth: 0,
            }}
            activeDot={{ r: isMobile ? 6 : 7 }}
            connectNulls
          />
          {zoom.refAreaLeft != null && zoom.refAreaRight != null ? (
            <ReferenceArea
              x1={zoom.refAreaLeft}
              x2={zoom.refAreaRight}
              strokeOpacity={0.3}
              fill="oklch(0.65 0.1 300)"
              fillOpacity={0.15}
            />
          ) : null}
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// ---------------------------------------------------------------------------
// Time Range Toolbar
// ---------------------------------------------------------------------------

function TimeRangeToolbar({
  value,
  onChange,
}: {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}) {
  return (
    <div className="flex justify-center">
      <div className="inline-flex items-center gap-0.5 rounded-full bg-muted/60 p-1 border border-border/40">
        {TIME_RANGES.map((r) => (
          <button
            key={r.key}
            onClick={() => onChange(r.key)}
            className={`rounded-full px-3 py-1 text-xs font-semibold tracking-wide
              transition-all duration-200 ${
                value === r.key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
          >
            {r.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Export
// ---------------------------------------------------------------------------

export function ChartReport({ data }: ChartReportProps) {
  const [mode, setMode] = useState<ChartMode>("combo");
  const [timeRange, setTimeRange] = useState<TimeRange>("max");

  // Derive filtered data during render (no useEffect / useMemo needed)
  const filteredData = filterByTimeRange(data, timeRange);

  // Changing time range resets zoom by re-keying chart components
  const chartKey = timeRange;

  return (
    <div className="flex flex-col gap-4">
      {/* Mode toggle */}
      <div className="flex gap-2 justify-center">
        <Button
          variant={mode === "combo" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("combo")}
        >
          Kombinált grafikon
        </Button>
        <Button
          variant={mode === "distinct" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("distinct")}
        >
          Külön grafikonok
        </Button>
      </div>

      {/* Time range selector */}
      <TimeRangeToolbar value={timeRange} onChange={setTimeRange} />

      {/* Hint text */}
      <p className="text-center text-xs text-muted-foreground/70">
        Húzd végig a grafikonon a nagyításhoz
      </p>

      {/* Charts — keyed by timeRange to reset zoom on range change */}
      {mode === "combo" ? (
        <ComboChart key={`combo-${chartKey}`} data={filteredData} />
      ) : (
        <div className="flex flex-col gap-4">
          <WeightChart key={`weight-${chartKey}`} data={filteredData} />
          <CircumferenceChart
            key={`circum-${chartKey}`}
            data={filteredData}
          />
        </div>
      )}
    </div>
  );
}
