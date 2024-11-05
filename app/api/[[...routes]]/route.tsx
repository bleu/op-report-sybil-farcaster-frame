/** @jsxImportSource frog/jsx */

import { Button, Frog, TextInput } from "frog";
import { devtools } from "frog/dev";
// import { neynar } from 'frog/hubs'
import { handle } from "frog/next";
import { serveStatic } from "frog/serve-static";

const generateCaptchaText = () => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const generateInitialState = () => {
  return { captchaText: generateCaptchaText() };
};

const generateRandomFontSize = () => {
  const sizes = [48, 56, 64];
  return sizes[Math.floor(Math.random() * sizes.length)];
};

const generateRandomAngle = () => {
  return Math.floor(Math.random() * 91) - 45;
};

const app = new Frog({
  initialState: generateInitialState(),
  assetsPath: "/",
  basePath: "/api",

  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
  title: "Farcaster Sybil Report",
});

app.frame("/verify-captcha", async (c) => {
  const { inputText, status } = c ?? {};
  const state = c.deriveState();

  c.req.header();

  //@ts-ignore
  const isValidated = inputText === state.captchaText;

  const intents = isValidated ? [] : [<Button action="/">Try Again</Button>];

  const casterFid = c.frameData?.castId.fid;
  const triggerFid = c.frameData?.fid;

  if (isValidated) {
    console.log("Validated report");
    console.log({ casterFid, triggerFid });
  } else {
    console.log("Validated report");
    console.log({ casterFid, triggerFid });
  }

  return c.res({
    image: (
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
        {isValidated
          ? "Congratulations! You just reported a bot"
          : "Wrong captcha!"}
      </div>
    ),
    intents,
  });
});

app.frame("/", (c) => {
  const { buttonValue, inputText, status } = c;
  const userInputtedText = inputText || buttonValue;

  if (status === "response") {
    c.deriveState((previousState) => {
      //@ts-ignore
      previousState.captchaText = generateCaptchaText();
    });
  }

  const state = c.deriveState();
  //@ts-ignore
  const characters = state.captchaText.split("");

  return c.res({
    image: (
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
        <p>You are about to report this user as sybil</p>
        <p>Just confirm you're human, enter the following text:</p>
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
    intents: [
      <TextInput placeholder="Your answer..." />,
      <Button value="valor do botao" action="/verify-captcha">
        Submit captcha
      </Button>,
      status === "response" && <Button.Reset>Reset</Button.Reset>,
    ],
  });
});

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
