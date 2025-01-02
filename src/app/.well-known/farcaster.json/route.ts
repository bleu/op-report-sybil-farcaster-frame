export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_URL;

  // // Use this to configure domain manifest
  //
  // const header = btoa(
  //   JSON.stringify({
  //     fid: 807252,
  //     type: "custody",
  //     key: "0xFE8F5FC4932Fadc764dF9DD57DFA8c9EcE2C6B74",
  //   })
  // );
  //
  // const payload = btoa(
  //   JSON.stringify({ domain: appUrl?.split("//").at(-1) })
  // );
  // console.log({header, payload});
  // signature is obtained signing `${header}.${payload}`

  // vercel
  const header =
    "IntcImZpZFwiOjkzMjIxNCxcInR5cGVcIjpcImN1c3RvZHlcIixcImtleVwiOlwiMHhGRThGNUZDNDkzMkZhZGM3NjRkRjlERDU3REZBOGM5RWNFMkM2Qjc0XCJ9Ig";
  const payload =
    "IntcImRvbWFpblwiOlwib3AtcmVwb3J0LXN5YmlsLWZhcmNhc3Rlci1mcmFtZS52ZXJjZWwuYXBwXCJ9Ig";
  const signature =
    "MHgzMmE5MWM3ZmUzMGEyOTQwYzUzZTMwNGRhYjUwMzMzMjU0MjFlN2I2NWMzMjg0ZTAzYTMxNWQwMzAzZTIzZGY2M2FiYWY5MTBiMDkxN2M2ZjI4Yzk0ZjgxMzVjODIzODEzYWVhNDYwZmEyNjA0MTMxY2U0NDdlYmQyNGI5MmFiMTFi";

  // ngrok
  // const header =
  //   "IntcImZpZFwiOjkzMjIxNCxcInR5cGVcIjpcImN1c3RvZHlcIixcImtleVwiOlwiMHhGRThGNUZDNDkzMkZhZGM3NjRkRjlERDU3REZBOGM5RWNFMkM2Qjc0XCJ9Ig";
  // const payload = "IntcImRvbWFpblwiOlwiamVhbi5uZ3Jvay5hcHBcIn0i";
  // const signature =
  //   "MHgwNmM4YzVjZmJhNWJlMjVhNDFhZmNiNmVmZjM5YzdhYTE5YjFhMjBjMTAyZWE1ZWIzNzVlYWVlYjIyZWM0ZThmMjQ4YWUwMGFkZjc0ODBlYmY1MTQxYjljZWZmNzU4NjliMzA3MDdlODM0MWYwYWQxNWU1NjRiMDRkNmU4MTQwZDFi";

  const config = {
    // accountAssociation: `${header}.${payload}.${signature}`,
    accountAssociation: {
      header,
      payload,
      signature,
    },
    frame: {
      version: "1",
      name: "Check Sybil",
      iconUrl: `${appUrl}/icon.png`,
      homeUrl: appUrl,
      imageUrl: `${appUrl}/opengraph-image`,
      buttonTitle: "Launch Frame",
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#f7f7f7",
      webhookUrl: `${appUrl}/api/webhook`,
    },
  };

  return Response.json(config);
}
