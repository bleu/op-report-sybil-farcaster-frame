import { ResponsivePie } from "@nivo/pie";
import { GraphLayout } from "./graph-layout";
import { StatsFormatted } from "~/lib/dashboard-types";

export const SybilAccounts = ({ data }: { data: StatsFormatted }) => {
  const trueDetectedSybils = data.true_detected_sybils || 0;
  const falseDetectedBenigns = data.false_detected_benigns || 0;
  const trueDetectedBenigns = data.true_detected_benigns || 0;
  const falseDetectedSybils = data.false_detected_sybils || 0;
  const trueUnknowns = data.true_unknowns || 0;
  const sybilsDetectedUnknowns = data.sybils_detected_unknowns || 0;
  const benignsDetectedUnknowns = data.benigns_detected_unknowns || 0;

  const actualSybils =
    trueDetectedSybils + falseDetectedBenigns + sybilsDetectedUnknowns;
  const actualBenigns =
    trueDetectedBenigns + falseDetectedSybils + benignsDetectedUnknowns;
  const actualUnknowns = trueUnknowns;

  const total = actualSybils + actualBenigns + actualUnknowns;

  const formattedData = [
    {
      id: "Unknown",
      value: actualUnknowns,
    },
    {
      id: "Sybil",
      value: actualSybils,
    },
    {
      id: "Benign",
      value: actualBenigns,
    },
  ];

  return (
    <GraphLayout title="Sybil Accounts">
      <div className="h-full">
        <ResponsivePie
          data={formattedData}
          margin={{ top: 10, right: 10, bottom: 50, left: 60 }}
          innerRadius={0.5}
          padAngle={0.7}
          cornerRadius={3}
          arcLinkLabelsSkipAngle={10}
          enableArcLabels={false}
          enableArcLinkLabels={true}
          arcLinkLabel={(d) => `${d.id} (${d.value.toLocaleString()})`}
          colors={["#6B7280", "#EF4444", "#3B82F6"]}
          layers={[
            "arcs",
            "arcLabels",
            "arcLinkLabels",
            ({ centerX, centerY }) => (
              <g>
                <text
                  x={centerX}
                  y={centerY - 10}
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{
                    fontSize: "12px",
                    fontWeight: "normal",
                  }}
                >
                  Farcaster Users
                </text>
                <text
                  x={centerX}
                  y={centerY + 15}
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{
                    fontSize: "16px",
                    fontWeight: "normal",
                  }}
                >
                  {total.toLocaleString()}
                </text>
              </g>
            ),
          ]}
        />
      </div>
    </GraphLayout>
  );
};
