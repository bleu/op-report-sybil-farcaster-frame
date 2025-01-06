import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

import { createReport, type CreateReportParams } from "~/app/client";

export interface CreateReportParamsQuery
  extends Omit<
    CreateReportParams,
    "reporterFid" | "targetFid" | "reportTimestamp"
  > {
  reporterFid: string;
  targetFid: string;
}

export async function POST(request: Request) {
  if (request.method !== "POST") {
    return Response.json(
      { message: "Only POST requests allowed" },
      { status: 405 }
    );
  }

  const data = (await request.json()) as CreateReportParamsQuery;

  const neededKeys = ["reporterFid", "targetFid", "reportedAsSybil"];

  const queriedKeys = Object.keys(data);

  const missingKeys = neededKeys.filter((item) => !queriedKeys.includes(item));

  if (missingKeys.length > 0) {
    return Response.json(
      {
        message: `Missing the following variables in queried data: ${missingKeys.join(
          ", "
        )}`,
      },
      { status: 400 }
    );
  }

  const typedData = {
    ...data,
    reporterFid: BigInt(data.reporterFid),
    targetFid: BigInt(data.targetFid),
    reportTimestamp: new Date(),
  } as CreateReportParams;

  try {
    const report = await createReport(typedData);
    if (report)
      return Response.json(
        { message: "Report created successfully" },
        { status: 200 }
      );
    return Response.json(
      { message: "Failed to add report on database" },
      { status: 500 }
    );
  } catch (e) {
    return Response.json({ message: (e as Error).message }, { status: 500 });
  }
}
