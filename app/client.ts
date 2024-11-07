import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface Report {
  reporterFid: bigint;
  sybilFid: bigint;
  castHash: string | undefined;
  messageHash: string | undefined;
  network: number | undefined;
  reportTimestamp: string | undefined;
}

export async function createReport(report: Report) {
  const _report = await prisma.report.create({
    data: report,
  });
  return _report;
}

export async function getSybilReportCount(fid: bigint) {
  const reportCount = await prisma.report.findMany({
    where: {
      sybilFid: { equals: fid },
    },
    distinct: ["reporterFid"],
  });
  return reportCount.length;
}

export async function getSybilReports(fid: bigint) {
  const reports = await prisma.report.findMany({
    where: {
      sybilFid: { equals: fid },
    },
  });

  const reportsProcessed = reports.map((report) => {
    return {
      ...report,
      reporterFid: report.reporterFid.toString(),
      sybilFid: report.sybilFid.toString(),
    };
  });

  return reportsProcessed;
}
