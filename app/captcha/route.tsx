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
        {/* <p>You are about to report this user as sybil</p> */}
        <p>Confirm you're human:</p>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          {characters.map((char: string, index: number) => (
            <div
              key={index}
              style={{
                fontSize: generateRandomFontSize(),
                transform: `rotate(${generateRandomAngle()}deg)`,
                marginRight: "30px",
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
