import { NextRequest, NextResponse } from "next/server";
import { getSybilReports } from "@/app/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fid = searchParams.get("fid");

    if (!fid) {
      return NextResponse.json(
        { error: "fid parameter is required" },
        { status: 400 }
      );
    }

    const reports = await getSybilReports(BigInt(fid));

    return NextResponse.json({ reports });
  } catch (error) {
    console.error("Error processing check-sybil request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
