"use client";

import { useEffect } from "react";

async function testCreateOffChainAttestation() {
  const appUrl = process.env.NEXT_PUBLIC_URL;

  const domainManifest = btoa(
    JSON.stringify({ domain: appUrl?.split("//").at(-1) })
  );
  console.log({ domainManifest });
}

export default function Page() {
  useEffect(() => {
    testCreateOffChainAttestation();
  }, []);
  return <div>Test</div>;
}
