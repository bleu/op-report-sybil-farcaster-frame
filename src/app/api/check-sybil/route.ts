import {
  getHumanReportCount,
  getSybilReportCount,
  getSybilProbability,
} from "~/app/client";
import {
  createApiResponse,
  createErrorResponse,
  parseBigInt,
  validateQueryParam,
  withErrorHandling,
} from "~/utils/api-helpers";

type CheckSybilResponse = {
  fid: string;
  fname: string | null;
  sybilProbability: number | null;
  diagnosis: "benign" | "sybil" | null;
  humanReports: number;
  sybilReports: number;
  lastUpdatedProbability: Date;
};

const checkSybil = async (request: Request): Promise<Response> => {
  const { searchParams } = new URL(request.url);
  const fidParam = validateQueryParam(searchParams, "fid");
  const fid = parseBigInt(fidParam, "FID");

  const [sybilProbability, humanReports, sybilReports] = await Promise.all([
    getSybilProbability(fid),
    getHumanReportCount(fid),
    getSybilReportCount(fid),
  ]);

  if (!sybilProbability) {
    return createErrorResponse(`fid not found: ${fidParam}`, 404);
  }

  const response: CheckSybilResponse = {
    fid: fidParam,
    fname: sybilProbability.fname,
    sybilProbability: sybilProbability.sybilProbability,
    diagnosis:
      sybilProbability.sybilDiagnosis === null
        ? null
        : sybilProbability.sybilDiagnosis
        ? "sybil"
        : "benign",
    lastUpdatedProbability: sybilProbability.lastUpdated,
    humanReports,
    sybilReports,
  };

  return Response.json(createApiResponse(response));
};

export const GET = withErrorHandling(checkSybil);
