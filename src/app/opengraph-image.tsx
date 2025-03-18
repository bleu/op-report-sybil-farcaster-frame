import { ImageResponse } from "next/og";
import fs from "fs/promises";
import path from "path";

export const alt = "Check Sybil";
export const size = {
  width: 600,
  height: 400,
};

export const contentType = "image/png";

export default async function Image() {
  // Get the path to your image
  const imagePath = path.join(
    process.cwd(),
    "public",
    "report-sybil-cover.png"
  );

  const imageBuffer = await fs.readFile(imagePath);
  const base64Image = `data:image/png;base64,${imageBuffer.toString("base64")}`;

  return new ImageResponse(
    (
      <div tw="h-full w-full flex items-center justify-center">
        <img src={base64Image} width={600} height={400} />
      </div>
    ),
    size
  );
}
