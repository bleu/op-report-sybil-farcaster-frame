import {
  EAS,
  Offchain,
  OffchainAttestationVersion,
  OffchainConfig,
  SignedOffchainAttestation,
} from "@ethereum-attestation-service/eas-sdk";
import { Address } from "viem";
import { optimism } from "viem/chains";

import { createReport, type CreateReportParams } from "~/app/client";

export interface CreateReportParamsQuery
  extends Omit<
    CreateReportParams,
    "reporterFid" | "targetFid" | "reportTimestamp"
  > {
  reporterFid: string;
  targetFid: string;
}

const EAS_OP_CONTRACT_ADDRESS = "0x4200000000000000000000000000000000000021";

function verifyReportSybilAttestation({
  attester,
  attestation,
}: {
  attester: Address;
  attestation: SignedOffchainAttestation;
}) {
  try {
    const eas = new EAS(EAS_OP_CONTRACT_ADDRESS); // Sepolia address
    const EAS_CONFIG: OffchainConfig = {
      address: EAS_OP_CONTRACT_ADDRESS,
      version: "1.0.1",
      chainId: BigInt(optimism.id),
    };
    const easOffchain = new Offchain(
      EAS_CONFIG,
      OffchainAttestationVersion.Version2,
      eas
    );

    const isValid = easOffchain.verifyOffchainAttestationSignature(
      attester,
      attestation
    );
    return isValid;
  } catch (error) {
    console.error("Error verifying attestation:", error);
    return false;
  }
}

export async function POST(request: Request) {
  if (request.method !== "POST") {
    return Response.json(
      { message: "Only POST requests allowed" },
      { status: 405 }
    );
  }

  const data = (await request.json()) as CreateReportParamsQuery;

  const neededKeys = [
    "reporterFid",
    "targetFid",
    "reportedAsSybil",
    "attestation",
  ];

  const queriedKeys = Object.keys(data);

  const missingKeys = neededKeys.filter((item) => !queriedKeys.includes(item));

  if (missingKeys.length > 0) {
    return Response.json(
      {
        message: `Missing the following variables in queried data: ${missingKeys.join(
          ", "
        )}`,
      },
      { status: 400 }
    );
  }

  const attestation = JSON.parse(data.attestation as string) as {
    attester: Address;
    attestation: SignedOffchainAttestation;
  };

  console.log({ attestation });

  let isValid;
  try {
    isValid = verifyReportSybilAttestation(attestation);
  } catch (e) {
    return Response.json(
      {
        message: `A valid attestation is needed to create a report. Got error: ${
          (e as Error).message
        }`,
      },
      { status: 400 }
    );
  }

  if (!isValid)
    return Response.json(
      {
        message: `A valid attestation is needed to create a report. Got invalid attestation`,
      },
      { status: 400 }
    );

  const typedData = {
    ...data,
    reporterFid: BigInt(data.reporterFid),
    targetFid: BigInt(data.targetFid),
    reportTimestamp: new Date(),
  } as CreateReportParams;

  try {
    const report = await createReport(typedData);
    if (report)
      return Response.json(
        { message: "Report created successfully" },
        { status: 200 }
      );
    return Response.json(
      { message: "Failed to add report on database" },
      { status: 500 }
    );
  } catch (e) {
    return Response.json({ message: (e as Error).message }, { status: 500 });
  }
}
