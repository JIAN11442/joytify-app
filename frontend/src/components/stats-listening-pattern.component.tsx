import { useEffect, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Label,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ScopedFormatMessage } from "../hooks/intl.hook";
import { HexPaletee, PopulatedMonthlyStatsResponse } from "@joytify/shared-types/types";

type StatsListeningPatternProps = {
  fm: ScopedFormatMessage;
  monthlyStats: PopulatedMonthlyStatsResponse;
  paletee: HexPaletee;
};

const getIntervalByComponentWidth = (width: number) => {
  if (width < 400) return 6; // mobile: 6 hours
  if (width < 768) return 4; // tablet: 4 hours
  if (width < 1024) return 2; // small desktop: 2 hours
  return 1; // large desktop: show 1 hour( 0 -> all hours)
};

const StatsListeningPattern: React.FC<StatsListeningPatternProps> = ({
  fm,
  monthlyStats,
  paletee,
}) => {
  const { peakHour } = monthlyStats;
  const containerRef = useRef<HTMLDivElement>(null);
  const [componentWidth, setComponentWidth] = useState(0);

  const hourChartData = Array.from({ length: 24 }, (_, hour) => {
    const existingData = peakHour.find((p) => p.hour === hour);
    return {
      hour: `${hour.toString().padStart(2, "0")}:00`,
      duration: existingData ? (existingData.totalDuration / 60).toFixed(2) : 0,
      utilization: existingData ? existingData.utilization : 0,
    };
  });

  const interval = getIntervalByComponentWidth(componentWidth);
  const isMobile = componentWidth < 400;

  const statsMonthlyStatsFm = fm("stats.monthlyStats");
  const listeningPatternFm = fm(`stats.monthlyStats.dashboard.24HourListeningPattern`);

  // get component width
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setComponentWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    const resizeObserver = new ResizeObserver(updateWidth);

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className={`stats-card-wrapper`}>
      {/* title */}
      <div className={`flex flex-col gap-2`}>
        <p className={`text-xl font-bold`}>{listeningPatternFm("title")}</p>
        <p className={`text-sm text-neutral-500`}>{listeningPatternFm("description")}</p>
      </div>

      {/* chart */}
      <div
        className={`
          mt-2
          ${isMobile ? "h-[17rem]" : "h-[15rem]"}
        `}
      >
        {hourChartData && hourChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourChartData} margin={{ left: -10, right: 0, top: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorDuration" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={paletee.vibrant} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={paletee.vibrant} stopOpacity={0.2} />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="hour"
                stroke="#b3b3b3"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                interval={interval}
                dy={10}
                height={65}
                padding={{ left: 20, right: 20 }}
              >
                <Label
                  value={listeningPatternFm("xAxis.label")}
                  position="insideBottom"
                  style={{
                    fontSize: "0.8rem",
                    color: "#b3b3b3",
                  }}
                />
              </XAxis>

              <YAxis stroke="#b3b3b3" fontSize={12} tickLine={false} axisLine={false} dx={10}>
                <Label
                  value={listeningPatternFm("yAxis.label")}
                  position="left"
                  offset={-20}
                  angle={-90}
                  dy={-80}
                  style={{
                    fontSize: "0.8rem",
                    color: "#b3b3b3",
                  }}
                />
              </YAxis>

              <CartesianGrid strokeDasharray="3 3" stroke={`${paletee.muted}20`} />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#191414",
                  border: `1px solid ${paletee.vibrant}`,
                  borderRadius: "8px",
                  color: paletee.vibrant,
                  fontSize: "0.875rem",
                }}
              />

              <Area
                type="monotone"
                dataKey="duration"
                stroke={paletee.vibrant}
                strokeWidth={2}
                fill="url(#colorDuration)"
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className={`flex h-full items-center justify-center`}>
            <p className="text-neutral-500">{statsMonthlyStatsFm("noData")}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsListeningPattern;
