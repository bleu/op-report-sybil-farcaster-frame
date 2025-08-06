import { Probability } from "~/lib/dashboard-types";
import { GraphLayout } from "./graph-layout";
import { ResponsiveBar } from "@nivo/bar";

export const SybilProbabilityDistribution = ({
  data,
}: {
  data: Probability[];
}) => {
  return (
    <GraphLayout title="Sybil Probability Distribution">
      <div className="h-full">
        <ResponsiveBar
          data={data}
          keys={["count"]}
          indexBy="end_interval"
          margin={{ top: 10, right: 10, bottom: 50, left: 60 }}
          colors={["#6B7280"]}
          padding={0.3}
          borderRadius={5}
          enableLabel={false}
          tooltipLabel={(d) =>
            `${Math.round((Number(d.data.end_interval) - 0.1) * 100) / 100} - ${
              d.data.end_interval
            }`
          }
        />
      </div>
    </GraphLayout>
  );
};
