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

  const header =
    "eyJmaWQiOjkzMjIxNCwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweEZFOEY1RkM0OTMyRmFkYzc2NGRGOURENTdERkE4YzlFY0UyQzZCNzQifQ";
  const payload =
    "eyJkb21haW4iOiJvcC1yZXBvcnQtc3liaWwtZmFyY2FzdGVyLWZyYW1lLnZlcmNlbC5hcHAifQ";
  const signature =
    "MHg5Y2Y2NDM2MmU0MTAzNTgxMjZlOWU2OTEwMWMwYWU3NDMwZTAyZmE0ZjE0MDAwYmQ4ZGQyNDUwYTVkZjI1Y2JkMDExNGVmZmQ4YzQ5MTRhYmY4MjFjMTE4MWFmYTRhYTc4MDgwMWFiNTQzMzM0ZjdjMTE2ZGUwNWNkZGFlYmNhYzFj";

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
