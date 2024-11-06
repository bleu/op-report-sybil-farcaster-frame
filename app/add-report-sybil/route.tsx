import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  //@ts-ignore
  const isValidated = searchParams.get("isValidated") === "true" ? true : false;

  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "linear-gradient(to right, #432889, #17101F)",
          backgroundSize: "100% 100%",
          display: "flex",
          flexDirection: "column",
          flexWrap: "nowrap",
          height: "100%",
          justifyContent: "center",
          textAlign: "center",
          width: "100%",
          fontSize: 60,
          color: "white",
          paddingLeft: 10,
          paddingRight: 10,
        }}
      >
        Add Report Sybil to your cast actions bar
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
