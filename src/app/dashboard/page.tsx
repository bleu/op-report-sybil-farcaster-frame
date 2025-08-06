"use client";

import useSWR from "swr";
import { DashboardDataResponse, StatsFormatted } from "~/lib/dashboard-types";
import { ReportActivity } from "~/components/dashboard/report-activity";
import { SybilProbabilityDistribution } from "~/components/dashboard/sybil-probability-distribution";
import { SybilAccounts } from "~/components/dashboard/sybil-accounts";
import { useMemo } from "react";
import { ModelOutputs } from "~/components/dashboard/model-outputs";

async function getData() {
  const response = await fetch("/api/dashboard");
  return response.json();
}

export default function DashboardPage() {
  const { data, error, isLoading } = useSWR<DashboardDataResponse>(
    "data",
    getData
  );

  const stats = useMemo(() => {
    return data?.data.statsSerialized.reduce((acc, item) => {
      acc[item.metric as keyof StatsFormatted] = item.value;
      return acc;
    }, {} as StatsFormatted);
  }, [data]);

  if (error) return <div>Failed to load</div>;
  if (isLoading) return <div>Loading...</div>;

  if (!data) return <div>No data</div>;

  return (
    <div className="flex flex-col gap-4 p-8 h-[100vh] size-full">
      <h1 className="text-2xl font-bold w-full border-b-2 text-center border-gray-400">
        Monitoring dashboard
      </h1>
      <div className="grid grid-cols-2 gap-4 items-center size-full h-full">
        <div className="flex flex-col gap-4 h-full">
          {stats && <ModelOutputs data={stats} />}
        </div>
        <div className="flex flex-col gap-4 h-full">
          {stats && <SybilAccounts data={stats} />}
        </div>
        <div className="flex flex-col gap-4 h-full">
          <ReportActivity data={data?.data.reportsSerialized} />
        </div>
        <div className="flex flex-col gap-4 h-full">
          <SybilProbabilityDistribution
            data={data?.data.probabilitiesSerialized}
          />
        </div>
      </div>
    </div>
  );
}
