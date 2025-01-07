import { getHumanReportCount, getSybilReportCount } from "~/app/client";
import {
  createApiResponse,
  validateQueryParam,
  parseBigInt,
  withErrorHandling,
} from "~/utils/api-helpers";

const getReports = async (request: Request): Promise<Response> => {
  const { searchParams } = new URL(request.url);
  const fidParam = validateQueryParam(searchParams, "fid");
  const fid = parseBigInt(fidParam, "FID");

  const [humanReports, sybilReports] = await Promise.all([
    getHumanReportCount(fid),
    getSybilReportCount(fid),
  ]);

  return Response.json(createApiResponse({ humanReports, sybilReports }));
};

export const GET = withErrorHandling(getReports);
