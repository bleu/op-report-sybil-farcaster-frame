/** @jsxImportSource frog/jsx */

import {
  decryptCaptchaChallenge,
  generateEncryptedCaptchaText,
  getAppUrl,
} from "@/app/utils";
import { Button, Frog, TextInput } from "frog";
import { devtools } from "frog/dev";
// import { neynar } from 'frog/hubs'
import { handle } from "frog/next";
import { serveStatic } from "frog/serve-static";
import { type Report, createReport } from "@/app/client";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

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
  try {
    const { inputText } = c ?? {};
    const state = c.deriveState();

    const isValidated =
      //@ts-ignore
      inputText === decryptCaptchaChallenge(state.captchaText);

    const intents = isValidated ? [] : [<Button action="/">Try Again</Button>];

    const reporterFid = c.frameData?.fid;
    const sybilFid = c.frameData?.castId.fid;

    if (!reporterFid || !sybilFid) {
      console.error("Missing necessary data (reporterFid or sybilfid)");
      throw new Error("Missing necessary data (reporterFid or sybilfid)");
    }

    if (c.frameData?.castId.hash === ZERO_ADDRESS) {
      console.error("There's not enough context to create a report");
      throw new Error("There's not enough context to create a report");
    }

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
      image: isValidated
        ? `${getAppUrl()}/success.png`
        : `${getAppUrl()}/wrong-captcha.png`,
      intents,
    });
  } catch (error) {
    return c.res({
      image: `${getAppUrl()}/error.png`,
      intents: [<Button action="/">Try Again</Button>],
    });
  }
});

app.frame("/", (c) => {
  if (c.status === "response") {
    c.deriveState((previousState) => {
      //@ts-ignore
      previousState.captchaText = generateEncryptedCaptchaText();
    });
  }

  return c.res({
    image: `${getAppUrl()}/captcha?text=${
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
    image: `${getAppUrl()}/add-report-sybil.png`,
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
