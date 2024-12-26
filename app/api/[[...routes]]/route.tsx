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
import {
  type CreateReportParams,
  createReport,
  getSybilReportCount,
} from "@/app/client";

interface StateType {
  captchaText?: string;
  reportType?: "human" | "sybil";
}

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const BASE_URL = process.env.APP_URL || "http://localhost:3000";

const app = new Frog({
  initialState: {
    captchaText: generateEncryptedCaptchaText(),
  },
  assetsPath: "/",
  basePath: "/api",

  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
  title: "Report Sybil",
});

app.frame("/verify-captcha", async (c) => {
  try {
    const { inputText } = c ?? {};
    const state = c.deriveState() as StateType;

    if (!state?.reportType || !state?.captchaText)
      throw new Error("Missing required variabled to verify captcha");

    const isValidated =
      inputText === decryptCaptchaChallenge(state.captchaText);

    if (!isValidated)
      return c.res({
        image: `${BASE_URL}/wrong-captcha.png`,
        intents: [<Button action="/">Try Again</Button>],
      });

    const reporterFid = c.frameData?.fid;
    const targetFid = c.frameData?.castId.fid;

    if (!reporterFid || !targetFid) {
      console.error("Missing necessary data (reporterFid or targetFid)");
      throw new Error("Missing necessary data (reporterFid or targetFid)");
    }

    if (c.frameData?.castId.hash === ZERO_ADDRESS) {
      console.error("There's not enough context to create a report");
      throw new Error("There's not enough context to create a report");
    }

    if (reporterFid && targetFid) {
      const reportLog: CreateReportParams = {
        reporterFid: BigInt(reporterFid),
        targetFid: BigInt(targetFid),
        castHash: c.frameData?.castId.hash || null,
        messageHash: c.frameData?.messageHash || null,
        reportTimestamp: c.frameData?.timestamp
          ? new Date(c.frameData.timestamp)
          : null,
        network: c.frameData?.network || null,
        reportedAsSybil: state.reportType === "sybil",
      };
      await createReport(reportLog);
    }

    const reportCount = targetFid
      ? String(await getSybilReportCount(BigInt(targetFid)))
      : "0";

    return c.res({
      image: `${BASE_URL}/success?reportCount=${reportCount}`,
      intents: [],
    });
  } catch (error) {
    return c.res({
      image: `${BASE_URL}/error.png`,
      intents: [<Button action="/">Try Again</Button>],
    });
  }
});

app.frame("/report", (c) => {
  const { buttonValue, deriveState } = c as {
    buttonValue: "human" | "sybil";
    deriveState: (updater?: (previousState: StateType) => void) => StateType;
  };
  if (c.status === "response") {
    deriveState((previousState) => {
      previousState.captchaText = generateEncryptedCaptchaText();
      previousState.reportType = buttonValue;
    });
  }

  return c.res({
    image: `${BASE_URL}/captcha?text=${deriveState().captchaText}`,
    intents: [
      <TextInput placeholder="Your answer..." />,
      <Button action="/verify-captcha">Submit</Button>,
    ],
  });
});

app.frame("/add-report-sybil", (c) => {
  return c.res({
    image: `${BASE_URL}/add-report-sybil.png`,
    intents: [
      <Button.AddCastAction action="/report">Add action</Button.AddCastAction>,
    ],
  });
});

app.frame("/", async (c) => {
  try {
    // example user data
    const urlParams = new URLSearchParams({
      fid: String(1_000_000),
      fname: "test-name",
      sybilProbability: String((100 * 0.578).toFixed(1)) + "%",
      sybilReports: String(254),
      humanReports: String(3190298),
    });

    return c.res({
      image: `${BASE_URL}/user-summary?${urlParams}`,
      intents: [
        <Button action="/report" value="human">
          Report human
        </Button>,
        <Button action="/report" value="sybil">
          Report sybil
        </Button>,
      ],
    });
  } catch (error) {
    return c.res({
      image: `${BASE_URL}/error.png`,
      // intents: [<Button action="/">Try Again</Button>],
    });
  }
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
