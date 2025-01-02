"use client";

import { useEffect } from "react";

async function testCreateOffChainAttestation() {
  const appUrl = process.env.NEXT_PUBLIC_URL;

  const domainManifest = btoa(
    JSON.stringify({ domain: appUrl?.split("//").at(-1) })
  );

  const headerManifest = btoa(
    JSON.stringify({
      fid: 932214,
      type: "custody",
      key: "0xFE8F5FC4932Fadc764dF9DD57DFA8c9EcE2C6B74",
    })
  );

  console.log({ headerManifest, domainManifest });
}

export default function Page() {
  useEffect(() => {
    testCreateOffChainAttestation();
  }, []);
  return <div>Test</div>;
}
