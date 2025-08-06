"use client"

import useSWR from "swr";
import { DashboardDataResponse } from "~/lib/dashboard-types";
import { ReportActivity } from "~/components/dashboard/report-activity";
import { SybilProbabilityDistribution } from "~/components/dashboard/sybil-probability-distribution";

async function getData() {
  const response = await fetch("/api/dashboard")
  return response.json()
}

export default function DashboardPage() {
  const { data, error, isLoading } = useSWR<DashboardDataResponse>("data", getData)
  
  if (error) return <div>Failed to load</div>
  if (isLoading) return <div>Loading...</div>

  if (!data) return <div>No data</div>

  
  return (
    <div className="grid grid-cols-2 gap-4 items-center size-full h-[100vh]">
      <div className="flex flex-col gap-4 h-full">
        {/* <ReportActivity data={data?.data.reportsSerialized} /> */}
      </div>
      <div className="flex flex-col gap-4 h-full">
        {/* <ReportActivity data={data?.data.reportsSerialized} /> */}
      </div>
      <div className="flex flex-col gap-4 h-full">
        <ReportActivity data={data?.data.reportsSerialized} />
      </div>
      <div className="flex flex-col gap-4 h-full">
        <SybilProbabilityDistribution data={data?.data.probabilitiesSerialized} />
      </div>
    </div>
  );
}