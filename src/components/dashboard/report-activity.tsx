import { ResponsiveBar } from "@nivo/bar";
import { Report } from "~/lib/dashboard-types";
import { formatDate } from "~/utils/date";
import { GraphLayout } from "./graph-layout";

const getIntegerTicks = (data: Report[]) => {
  const maxValue = Math.max(...data.map((d) => d.report_count));
  const ticks = [];
  for (let i = 0; i <= maxValue; i++) {
    if (i % Math.ceil(maxValue / 5) === 0) {
      ticks.push(i);
    }
  }
  return ticks;
};

export const ReportActivity = ({ data }: { data: Report[] }) => {
  const formattedData = aggregateData(data);
  const integerTicks = getIntegerTicks(formattedData);

  return (
    <GraphLayout title="Report Activity">
      <div className="h-full">
        <ResponsiveBar
          data={formattedData}
          keys={["report_count"]}
          indexBy="date"
          margin={{ top: 10, bottom: 50, left: 60, right: 10 }}
          padding={0.3}
          colors={["#6B7280"]}
          theme={{
            text: {
              fill: "currentColor",
            },
          }}
          borderRadius={5}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "Period",
            legendOffset: 32,
            renderTick(props) {
              return (
                <text
                  x={props.x}
                  y={props.y + 15}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{
                    fontSize: "12px",
                    fill: "currentColor",
                  }}
                >
                  {props.value.length > 5
                    ? String(props.value).substring(0, 5).trim() + "..."
                    : props.value}
                </text>
              );
            },
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "Report Count",
            legendOffset: -40,
            legendPosition: "middle",
            tickValues: integerTicks,
          }}
          enableLabel={false}
          tooltipLabel={(d) => `${d.data.date}`}
          gridYValues={integerTicks}
        />
      </div>
    </GraphLayout>
  );
};

const aggregateData = (data: Report[]) => {
  const daysCount = data.length;

  const dateFormat = (() => {
    switch (true) {
      case daysCount <= 14:
        return "day";
      case daysCount <= 90:
        return "week";
      case daysCount <= 1000:
        return "month";
      default:
        return "year";
    }
  })();

  const aggregatedData = data.reduce((acc, item) => {
    const date = formatDate(item.date, dateFormat);
    if (!acc[date]) {
      acc[date] = 0;
    }
    acc[date] += item.report_count;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(aggregatedData).map(([date, count]) => ({
    date,
    report_count: count,
  }));
};
