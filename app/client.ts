import { PrismaClient, Report } from "@prisma/client";

const prisma = new PrismaClient();

export type CreateReportParams = Omit<Report, "id" | "createdAt">;

export async function createReport(report: CreateReportParams) {
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
