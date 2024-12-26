import { PrismaClient, Report } from "@prisma/client";

const prisma = new PrismaClient();

export type CreateReportParams = Omit<Report, "id" | "createdAt">;

export async function createReport(data: CreateReportParams) {
  const report = await prisma.report.create({
    data,
  });
  return report;
}

export async function getSybilReportCount(fid: bigint) {
  const result =
    await prisma.$queryRaw`SELECT COUNT(DISTINCT reporter_fid) FROM reports as count WHERE sybil_fid = ${fid}`;
  //@ts-ignore
  return Number(result[0].count);
}

export async function getSybilReports(fid: bigint) {
  const reports = await prisma.report.findMany({
    where: {
      targetFid: { equals: fid },
    },
  });

  const reportsProcessed = reports.map((report) => {
    return {
      ...report,
      reporterFid: report.reporterFid.toString(),
      targetFid: report.targetFid.toString(),
    };
  });

  return reportsProcessed;
}
