import { CiCalendar } from "react-icons/ci";
import Icon from "./react-icons.component";
import AnimationWrapper from "./animation-wrapper.component";
import OdometerAnimated from "./odometer-animated.component";
import { ScopedFormatMessage } from "../hooks/intl.hook";
import { HexPaletee, PopulatedMonthlyStatsResponse } from "@joytify/types/types";
import { getMonthlyStatsOverviewContent } from "../contents/stats-overview.content";

type StatsOverviewSectionProps = {
  fm: ScopedFormatMessage;
  yearMonth: string;
  monthlyStats: PopulatedMonthlyStatsResponse;
  paletee: HexPaletee;
};

const StatsOverviewSection: React.FC<StatsOverviewSectionProps> = ({
  fm,
  yearMonth,
  monthlyStats,
  paletee,
}) => {
  const monthFm = fm("month");
  const monthlyStatsFm = fm("stats.monthlyStats");

  const [year, month] = yearMonth.split("-");
  const monthlyStatsOverviewContent = getMonthlyStatsOverviewContent({ fm, monthlyStats });

  return (
    <div
      className={`
        flex
        flex-col
        gap-10
    `}
    >
      {/* header  */}
      <AnimationWrapper
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`
          flex
          w-full
          items-start
          justify-between
        `}
      >
        {/* title & description */}
        <div className={`flex flex-col gap-3`}>
          <p className={`text-5xl font-bold info-title`}>
            {monthlyStatsFm("title", { month: monthFm(month), year })}
          </p>

          <p className={`text-grey-custom/50`}>{monthlyStatsFm("description")}</p>
        </div>

        {/* date */}
        <div
          style={{ backgroundColor: paletee.darkMuted }}
          className={`
            flex
            py-2
            px-3
            gap-1
            text-sm
            font-ubuntu
            shadow-lg
            items-center
            rounded-full
            max-sm:hidden
          `}
        >
          <Icon name={CiCalendar} opts={{ size: 20 }} className={`shrink-0`} />
          {monthlyStatsFm("date", { month: monthFm(month), year })}
        </div>
      </AnimationWrapper>

      {/* overview */}
      <AnimationWrapper
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className={`
          grid
          grid-cols-1
          md:grid-cols-4
          sm:grid-cols-2
          gap-5
        `}
      >
        {monthlyStatsOverviewContent.map((field) => {
          const { id, icon, description, value } = field;
          const isGrowthRate = id === "overview-total-growth-rate";
          const valueIsNumber = typeof value === "number";
          const isZero = valueIsNumber && value === 0;
          const isPositive = valueIsNumber && value > 0;
          const textColor =
            isGrowthRate && !isZero
              ? isPositive
                ? "text-green-500"
                : "text-red-400"
              : "text-neutral-300";

          return (
            <div key={id} className={`stats-card-wrapper`}>
              <Icon
                name={icon.name}
                opts={{ size: icon.size, color: icon.color }}
                className={`shrink-0`}
              />
              <div className={`flex flex-col gap-2`}>
                {valueIsNumber ? (
                  <OdometerAnimated
                    value={value}
                    type={"number"}
                    prefix={isGrowthRate && isPositive ? "+" : ""}
                    suffix={isGrowthRate ? " %" : ""}
                    className={`
                      -mt-4
                      text-[2.5rem]
                      font-bold
                      truncate
                      line-clamp-1
                      ${textColor}
                    `}
                  />
                ) : (
                  <p
                    className={`
                      text-4xl 
                      font-bold
                      truncate
                      ${textColor}
                    `}
                  >
                    {value}
                  </p>
                )}
                <p className={`text-sm text-neutral-400`}>{description}</p>
              </div>
            </div>
          );
        })}
      </AnimationWrapper>
    </div>
  );
};

export default StatsOverviewSection;
