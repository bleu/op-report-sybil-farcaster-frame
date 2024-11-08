import { ImageResponse } from "next/og";
import {
  decryptCaptchaChallenge,
  generateRandomAngle,
  generateRandomFontSize,
} from "../utils";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  //@ts-ignore
  const characters = decryptCaptchaChallenge(searchParams.get("text")).split(
    ""
  );

  const imageData = await fetch(new URL("./captcha.png", import.meta.url)).then(
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
            top: "282px",
            left: "280px",
            width: "640px",
            height: "160px",
            color: "#2a2a2a",
            paddingLeft: "20px",
          }}
        >
          {characters.map((char: string, index: number) => (
            <div
              key={index}
              style={{
                fontSize: generateRandomFontSize(),
                transform: `rotate(${generateRandomAngle()}deg)`,
                marginRight: "40px",
              }}
            >
              {char}
            </div>
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
