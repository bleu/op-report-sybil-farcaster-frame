import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const reportCount = searchParams.get("reportCount");

  console.log({ reportCount });

  const imageData = await fetch(new URL("./success.png", import.meta.url)).then(
    (res) => res.arrayBuffer()
  );

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
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            position: "absolute",
            top: "400px",
            left: "280px",
            width: "640px",
            height: "80px",
            color: "#ffffff",
            fontSize: 52,
          }}
        >
          {reportCount}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
