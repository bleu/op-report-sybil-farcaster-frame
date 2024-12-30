"use client";

import { useEffect } from "react";
import {
  createReportSybilAttestation,
  verifyReportSybilAttestation,
} from "./utils";
import type { Address } from "viem";

async function testCreateOffChainAttestation() {
  const appUrl = process.env.NEXT_PUBLIC_URL;

  const domainManifest = btoa(
    JSON.stringify({ domain: appUrl?.split("//").at(-1) })
  );
  console.log({ domainManifest });
  // await createReportSybilAttestation(
  //   BigInt(1_000_000),
  //   BigInt(1_000_001),
  //   true
  // );
  // const isValid = verifyReportSybilAttestation({
  //   attester: attester as Address,
  //   signedAttestation,
  // });
  // console.log("attestation is valid:", isValid);

  // const corruptedUid = signedAttestation.uid.replace("0", "1");
  // const corruptedAttestation = { ...signedAttestation, uid: corruptedUid };
  // const corruptedIsValid = verifyReportSybilAttestation({
  //   attester: attester as Address,
  //   signedAttestation: corruptedAttestation,
  // });
  // console.log("corrupted attestation is valid:", corruptedIsValid);
}

export default function Page() {
  useEffect(() => {
    testCreateOffChainAttestation();
  }, []);
  return <div>Test</div>;
}
