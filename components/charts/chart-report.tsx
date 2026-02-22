"use client";

import { useState } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  LineChart,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ChartDataPoint {
  date: string;
  fullDate: string;
  weight: number;
  circumference: number | null;
}

interface ChartReportProps {
  data: ChartDataPoint[];
}

type ChartMode = "combo" | "distinct";

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
          {entry.name}: <span className="font-semibold">{entry.value?.toFixed(1)}</span>
          {entry.name === "Weight" ? " kg" : " cm"}
        </p>
      ))}
    </div>
  );
}

function ComboChart({ data }: { data: ChartDataPoint[] }) {
  const weights = data.map((d) => d.weight);
  const circumferences = data
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

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Weight & Circumference</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              className="fill-muted-foreground"
            />
            <YAxis
              yAxisId="weight"
              orientation="right"
              domain={[weightMin, weightMax]}
              tick={{ fontSize: 12 }}
              className="fill-muted-foreground"
              label={{
                value: "kg",
                angle: 90,
                position: "insideRight",
                style: { fontSize: 11 },
              }}
            />
            <YAxis
              yAxisId="circumference"
              orientation="left"
              domain={[circumMin, circumMax]}
              tick={{ fontSize: 12 }}
              className="fill-muted-foreground"
              label={{
                value: "cm",
                angle: -90,
                position: "insideLeft",
                style: { fontSize: 11 },
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              yAxisId="weight"
              dataKey="weight"
              name="Weight"
              fill="oklch(0.7 0.12 340)"
              opacity={0.7}
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
            <Line
              yAxisId="circumference"
              dataKey="circumference"
              name="Circumference"
              stroke="oklch(0.65 0.1 300)"
              strokeWidth={2}
              dot={{ r: 4, fill: "oklch(0.65 0.1 300)", strokeWidth: 0 }}
              activeDot={{ r: 6 }}
              connectNulls
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function WeightChart({ data }: { data: ChartDataPoint[] }) {
  const weights = data.map((d) => d.weight);
  const weightMin = Math.floor(Math.min(...weights) - 2);
  const weightMax = Math.ceil(Math.max(...weights) + 2);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Weight (kg)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              className="fill-muted-foreground"
            />
            <YAxis
              domain={[weightMin, weightMax]}
              tick={{ fontSize: 12 }}
              className="fill-muted-foreground"
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="weight"
              name="Weight"
              fill="oklch(0.7 0.12 340)"
              opacity={0.8}
              radius={[4, 4, 0, 0]}
              barSize={24}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function CircumferenceChart({ data }: { data: ChartDataPoint[] }) {
  const circumferences = data
    .map((d) => d.circumference)
    .filter((v): v is number => v != null);

  if (circumferences.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Circumference (cm)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8 text-sm">
            No circumference data recorded yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  const circumMin = Math.floor(Math.min(...circumferences) - 5);
  const circumMax = Math.ceil(Math.max(...circumferences) + 5);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Circumference (cm)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              className="fill-muted-foreground"
            />
            <YAxis
              domain={[circumMin, circumMax]}
              tick={{ fontSize: 12 }}
              className="fill-muted-foreground"
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              dataKey="circumference"
              name="Circumference"
              stroke="oklch(0.65 0.1 300)"
              strokeWidth={2}
              dot={{ r: 5, fill: "oklch(0.65 0.1 300)", strokeWidth: 0 }}
              activeDot={{ r: 7 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function ChartReport({ data }: ChartReportProps) {
  const [mode, setMode] = useState<ChartMode>("combo");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 justify-center">
        <Button
          variant={mode === "combo" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("combo")}
        >
          Combo Chart
        </Button>
        <Button
          variant={mode === "distinct" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("distinct")}
        >
          Separate Charts
        </Button>
      </div>

      {mode === "combo" ? (
        <ComboChart data={data} />
      ) : (
        <div className="flex flex-col gap-4">
          <WeightChart data={data} />
          <CircumferenceChart data={data} />
        </div>
      )}
    </div>
  );
}
