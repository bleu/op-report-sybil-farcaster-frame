import useSWR from "swr";
import { CreateReportParamsQuery } from "~/app/api/create-report/route";

export function useCreateReport(report: CreateReportParamsQuery | undefined) {
  const createReport = async (
    report: CreateReportParamsQuery
  ): Promise<boolean> => {
    try {
      const response = await fetch("/api/create-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(report),
      });

      if (response.status === 200) return true;
      return false;
    } catch (e) {
      return false;
    }
  };

  return useSWR<boolean>(report ? report : null, createReport, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    shouldRetryOnError: false,
  });
}
