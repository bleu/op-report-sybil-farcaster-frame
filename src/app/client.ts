import { PrismaClient, Report } from "@prisma/client";
import { JsonObject, JsonArray } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

export interface CreateReportParams
  extends Omit<Report, "id" | "createdAt" | "attestation"> {
  attestation: string | number | boolean | JsonObject | JsonArray | undefined;
}

export async function createReport(data: CreateReportParams) {
  const report = await prisma.report.create({
    data,
  });
  return report;
}

export async function getSybilReportCount(fid: bigint) {
  const result =
    await prisma.$queryRaw`SELECT COUNT(DISTINCT reporter_fid) FROM reports as count WHERE target_fid = ${fid} AND reported_as_sybil = true`;
  //@ts-ignore
  return Number(result[0].count);
}

export async function getHumanReportCount(fid: bigint) {
  const result =
    await prisma.$queryRaw`SELECT COUNT(DISTINCT reporter_fid) FROM reports as count WHERE target_fid = ${fid} AND reported_as_sybil = false`;
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
