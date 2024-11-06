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

  const reportLog = {
    triggerFid: c.frameData?.fid,
    casterFid: c.frameData?.castId.fid,
    castHash: c.frameData?.castId.hash,
    messageHash: c.frameData?.messageHash,
    timestamp: c.frameData?.timestamp,
    network: c.frameData?.network,
  };
  if (isValidated) {
    console.log("Validated report");
    console.log({ reportLog });
  } else {
    console.log("Not Valid report");
    console.log({ reportLog });
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
      <Button.AddCastAction action="/report">Add action</Button.AddCastAction>,
    ],
  });
});

app.castAction(
  "/report",
  (c) => {
    // console.log({ req: c.req.json() });
    // console.log({ actionData: c.actionData });
    // console.log(
    //   `Cast Action to ${JSON.stringify(c.actionData.castId)} from ${
    //     c.actionData.fid
    //   }`
    // );
    return c.res({ type: "frame", path: "/" });
  },
  { name: "Report Sybil", icon: "megaphone" }
);

devtools(app, { serveStatic });

export const GET = handle(app);
export const POST = handle(app);

// NOTE: That if you are using the devtools and enable Edge Runtime, you will need to copy the devtools
// static assets to the public folder. You can do this by adding a script to your package.json:
// ```json
// {
//   scripts: {
//     "copy-static": "cp -r ./node_modules/frog/_lib/ui/.frog ./public/.frog"
//   }
// }
// ```
// Next, you'll want to set up the devtools to use the correct assets path:
// ```ts
// devtools(app, { assetsPath: '/.frog' })
// ```
