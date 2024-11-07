/** @jsxImportSource frog/jsx */

import {
  decryptCaptchaChallenge,
  generateEncryptedCaptchaText,
} from "@/app/utils";
import { Button, Frog, TextInput } from "frog";
import { devtools } from "frog/dev";
// import { neynar } from 'frog/hubs'
import { handle } from "frog/next";
import { serveStatic } from "frog/serve-static";
import { type Report, createReport } from "@/app/client";

const app = new Frog({
  initialState: {
    captchaText: generateEncryptedCaptchaText(),
  },
  assetsPath: "/",
  basePath: "/api",

  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
  title: "Farcaster Sybil Report",
});

app.frame("/verify-captcha", async (c) => {
  const { inputText } = c ?? {};
  const state = c.deriveState();

  //@ts-ignore
  const isValidated = inputText === decryptCaptchaChallenge(state.captchaText);

  const intents = isValidated ? [] : [<Button action="/">Try Again</Button>];

  const reporterFid = c.frameData?.fid;
  const sybilFid = c.frameData?.castId.fid;

  if (reporterFid && sybilFid && isValidated) {
    const reportLog: Report = {
      reporterFid: BigInt(reporterFid),
      sybilFid: BigInt(sybilFid),
      castHash: c.frameData?.castId.hash,
      messageHash: c.frameData?.messageHash,
      reportTimestamp: c.frameData?.timestamp
        ? new Date(c.frameData.timestamp).toISOString()
        : undefined,
      network: c.frameData?.network,
    };
    await createReport(reportLog);
    if (isValidated) {
      console.log("Validated report");
      console.log({ reportLog });
    }
  }

  return c.res({
    image: `${
      process.env.APP_URL || "http://localhost:3000"
    }/success?isValidated=${String(isValidated)}`,
    intents,
  });
});

app.frame("/", (c) => {
  if (c.status === "response") {
    c.deriveState((previousState) => {
      //@ts-ignore
      previousState.captchaText = generateEncryptedCaptchaText();
    });
  }

  return c.res({
    image: `${process.env.APP_URL || "http://localhost:3000"}/captcha?text=${
      //@ts-ignore
      c.deriveState().captchaText
    }`,
    intents: [
      <TextInput placeholder="Your answer..." />,
      <Button action="/verify-captcha">Submit</Button>,
    ],
  });
});

app.frame("/add-report-sybil", (c) => {
  return c.res({
    image: `${process.env.APP_URL || "http://localhost:3000"}/add-report-sybil`,
    intents: [
      <Button.AddCastAction action="/report">Add action</Button.AddCastAction>,
    ],
  });
});

app.castAction(
  "/report",
  (c) => {
    return c.res({ type: "frame", path: "/" });
  },
  { name: "Report Sybil", icon: "megaphone" }
);

devtools(app, { serveStatic });

export const GET = handle(app);
export const POST = handle(app);
