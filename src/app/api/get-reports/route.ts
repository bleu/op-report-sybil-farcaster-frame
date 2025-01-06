import { getHumanReportCount, getSybilReportCount } from "~/app/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fidParam = searchParams.get("fid");
    if (!fidParam) {
      return Response.json(
        { error: "FID parameter is required" },
        { status: 400 }
      );
    }

    // Validate FID is a valid number
    const parsedFid = parseInt(fidParam);
    if (isNaN(parsedFid) || parsedFid <= 0) {
      return Response.json(
        { error: "Invalid FID parameter. Must be a positive number" },
        { status: 400 }
      );
    }

    const humanReports = await getHumanReportCount(BigInt(parsedFid));
    const sybilReports = await getSybilReportCount(BigInt(parsedFid));

    return Response.json({
      success: true,
      data: {
        humanReports: humanReports,
        sybilReports: sybilReports,
      },
    });
  } catch (e) {
    const error = e as Error;
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}
