/** @jsxImportSource frog/jsx */

import { Button, Frog, TextInput } from "frog";
import { devtools } from "frog/dev";
// import { neynar } from 'frog/hubs'
import { handle } from "frog/next";
import { serveStatic } from "frog/serve-static";
//import { generateCaptchaChallenge } from "@airstack/frog";
//import { validateCaptchaChallenge } from "@airstack/frog";

// const generateRandomNumber = () => {
//   const rNumber = Math.floor(Math.random() * 49) + 1;
//   console.log("generating random number", rNumber);
//   return rNumber;
// };

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
  // return {
  //   numA: generateRandomNumber(),
  //   numB: generateRandomNumber(),
  // };
  return { captchaText: generateCaptchaText() };
};

const generateRandomFontSize = () => {
  const sizes = [48, 56, 64];
  return sizes[Math.floor(Math.random() * sizes.length)];
};

const generateRandomAngle = () => {
  // Generate a random number between -45 and 45
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
  console.log("IN VERIFY CAPTCHA");
  const { inputText, status } = c ?? {};
  const state = c.deriveState();
  console.log({ status });
  console.log({ state });
  console.log({ previousState: c.previousState });
  console.log({ inputText });

  // const isValidated = Number(inputText) === state.numA + state.numB;
  const isValidated = inputText === state.captchaText;

  const intents = isValidated ? [] : [<Button action="/">Try Again</Button>];

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
  console.log("IN MAIN APP");
  const { buttonValue, inputText, status } = c;
  const userInputtedText = inputText || buttonValue;

  if (status === "response") {
    c.deriveState((previousState) => {
      // Clear Frames state
      // previousState.numA = generateRandomNumber();
      // previousState.numB = generateRandomNumber();
      previousState.captchaText = generateCaptchaText();
    });
    console.log("status is of type response");
  }

  const state = c.deriveState();

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
        {/* <p>{`Just confirm you're human, enter the sum of ${state.numA} and ${state.numB}`}</p> */}
        <p>Just confirm you're human, enter the following text:</p>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: generateRandomFontSize(),
              transform: `rotate(${generateRandomAngle()}deg)`,
              marginRight: "30px",
            }}
          >
            {state.captchaText[0]}
          </div>
          <div
            style={{
              fontSize: generateRandomFontSize(),
              transform: `rotate(${generateRandomAngle()}deg)`,
              marginRight: "30px",
            }}
          >
            {state.captchaText[1]}
          </div>
          <div
            style={{
              fontSize: generateRandomFontSize(),
              transform: `rotate(${generateRandomAngle()}deg)`,
              marginRight: "30px",
            }}
          >
            {state.captchaText[2]}
          </div>
          <div
            style={{
              fontSize: generateRandomFontSize(),
              transform: `rotate(${generateRandomAngle()}deg)`,
              marginRight: "30px",
            }}
          >
            {state.captchaText[3]}
          </div>
          <div
            style={{
              fontSize: generateRandomFontSize(),
              transform: `rotate(${generateRandomAngle()}deg)`,
              marginRight: "30px",
            }}
          >
            {state.captchaText[4]}
          </div>
          <div
            style={{
              fontSize: generateRandomFontSize(),
              transform: `rotate(${generateRandomAngle()}deg)`,
              marginRight: "30px",
            }}
          >
            {state.captchaText[5]}
          </div>
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
