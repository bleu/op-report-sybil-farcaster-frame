import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const fid = searchParams.get("fid");
  const fname = searchParams.get("fname");
  const sybilProbability = searchParams.get("sybilProbability");
  const sybilReports = searchParams.get("sybilReports");
  const humanReports = searchParams.get("humanReports");

  const fnameFontSize = fname?.length && fname.length > 13 ? 30 : 40;

  const imageData = await fetch(
    new URL("./user-summary.png", import.meta.url)
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "black",
          backgroundSize: "100% 100%",
          display: "flex",
          flexDirection: "column",
          flexWrap: "nowrap",
          height: "100%",
          justifyContent: "center",
          textAlign: "center",
          width: "100%",
          color: "white",
        }}
      >
        <img
          style={{ position: "absolute", top: "0", left: "0" }}
          width="1200"
          height="630"
          alt=""
          //@ts-ignore
          src={imageData}
        />
        <div // fid
          style={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            textAlign: "left",
            position: "absolute",
            left: "29px",
            top: "90px",
            width: "200px",
            height: "40px",
            color: "#ffffff",
            fontSize: 40,
          }}
        >
          {fid}
        </div>
        <div // fname
          style={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            textAlign: "right",
            position: "absolute",
            left: "323px",
            top: "90px",
            width: "200px",
            height: "40px",
            color: "#ffffff",
            fontSize: fnameFontSize,
          }}
        >
          {fname}
        </div>
        <div // Sybil Probability
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            position: "absolute",
            left: "400px",
            top: "280px",
            width: "400px",
            height: "110px",
            color: "#ffffff",
            fontSize: 120,
          }}
        >
          {sybilProbability}
        </div>
        <div // Sybil Reports
          style={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            textAlign: "center",
            position: "absolute",
            left: "911px",
            top: "90px",
            width: "200px",
            height: "40px",
            color: "#ffffff",
            fontSize: 40,
          }}
        >
          {sybilReports}
        </div>
        <div // Human Reports
          style={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            textAlign: "left",
            position: "absolute",
            left: "617px",
            top: "90px",
            width: "200px",
            height: "40px",
            color: "#ffffff",
            fontSize: 40,
          }}
        >
          {humanReports}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
