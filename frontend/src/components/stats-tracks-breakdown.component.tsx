import { useEffect, useRef, useState } from "react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer } from "recharts";
import { PieLabelProps } from "recharts/types/polar/Pie";
import { ScopedFormatMessage } from "../hooks/intl.hook";
import { PopulatedMonthlyStatsResponse } from "@joytify/types/types";

type StatsTracksBreakdownProps = {
  fm: ScopedFormatMessage;
  monthlyStats: PopulatedMonthlyStatsResponse;
};

const renderCustomizedLabel =
  (color: string = "#262626") =>
  ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: PieLabelProps) => {
    const RADIAN = Math.PI / 180;

    // calculate the center of the slice
    const sliceCenterRadius = (innerRadius + outerRadius) / 2; // the center of the slice
    const x = cx + sliceCenterRadius * Math.cos(-(midAngle ?? 0) * RADIAN);
    const y = cy + sliceCenterRadius * Math.sin(-(midAngle ?? 0) * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill={color}
        fontSize="12"
        fontWeight="bold"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {`${((percent ?? 1) * 100).toFixed(0)}%`}
      </text>
    );
  };

const StatsTracksBreakdown: React.FC<StatsTracksBreakdownProps> = ({ fm, monthlyStats }) => {
  const { songs, summary } = monthlyStats;

  const containerRef = useRef<HTMLDivElement>(null);
  const [componentWidth, setComponentWidth] = useState(0);

  const songChartData = songs.slice(0, 5).map((song) => ({
    name: song.title,
    value: parseFloat(song.totalDuration.toFixed(2)),
    percentage: parseFloat(((song.totalDuration / summary.totalDuration) * 100).toFixed(2)),
    paletee: song.paletee,
  }));

  const isMobile = componentWidth < 400;
  const statsMonthlyStatsFm = fm("stats.monthlyStats");
  const topTracksBreakdownFm = fm(`stats.monthlyStats.dashboard.topTracksBreakdown`);

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
        <p className={`text-xl font-bold`}>{topTracksBreakdownFm("title")}</p>
        <p className={`text-sm text-neutral-500`}>{topTracksBreakdownFm("description")}</p>
      </div>

      {/* pie chart */}
      <div
        className={`
          mt-2
          ${isMobile ? "h-[17rem]" : "h-[15rem]"} 
        `}
      >
        {songChartData && songChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={songChartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                labelLine={false}
                label={(props) => {
                  const dataItem = songChartData.find(
                    (item) => item.value === props.payload?.value
                  );
                  const color = dataItem?.paletee.darkVibrant;
                  return renderCustomizedLabel(color)(props);
                }}
              >
                {songChartData.map((entry, index) => {
                  const { paletee } = entry;
                  return <Cell key={`pie-cell-${index}`} fill={paletee.vibrant} />;
                })}
              </Pie>

              <Legend
                layout={isMobile ? "horizontal" : "vertical"}
                verticalAlign={isMobile ? "bottom" : "top"}
                align={isMobile ? "center" : "right"}
                wrapperStyle={{
                  paddingTop: "10px",
                  fontSize: "0.875rem",
                }}
                iconSize={10}
                iconType="circle"
              />
            </PieChart>
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

export default StatsTracksBreakdown;
