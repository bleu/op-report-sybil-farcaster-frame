import { ResponsiveBar } from '@nivo/bar';
import { Report } from '~/lib/dashboard-types';
import { formatDate } from '~/utils/date';

export const ReportActivity = ({ data }: { data: Report[] }) => {
  const formattedData = aggregateData(data);

  return (
    <div className="flex flex-col gap-4 min-h-[300px] h-full">
      <h2 className="text-2xl font-bold">Report Activity</h2>
      <div className="h-full">
        <ResponsiveBar
          data={formattedData}
          keys={['report_count']}
          indexBy="date"
          margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
          padding={0.3}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Period',
            legendOffset: 32,
            renderTick(props) {
              return (
                <text
                  x={props.x}
                  y={props.y + 15}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{
                    fontSize: '12px',
                    fill: '#666',
                  }}
                >
                  {props.value.length > 5 ? String(props.value).substring(0, 5).trim() + '...' : props.value}
                </text>
              );
            },
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Report Count',
            legendOffset: -40,
            legendPosition: 'middle',
          }}
          enableLabel={false}
          tooltipLabel={(d) => `${d.data.date}`}
        />
      </div>
    </div>
  );
};

const aggregateData = (data: Report[]) => {
  const daysCount = data.length;

  const dateFormat = (() => {
    console.log(daysCount);
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