import {
  SchemaEncoder,
  SignedOffchainAttestation,
  OffchainAttestationTypedData,
  TransactionSigner,
  EAS,
} from "@ethereum-attestation-service/eas-sdk";
import { useCallback, useEffect, useState } from "react";
import { Address, encodePacked, keccak256, zeroAddress } from "viem";
import { useSignTypedData } from "wagmi";
import { useSigner } from "./useSigner";
import { solidityPackedKeccak256, hexlify, toUtf8Bytes } from "ethers";

const REPORT_SYBIL_SCHEMA_STRING =
  "uint256 reporterFid, uint256 targetFid, bool reportedAsSybil";

const EAS_OP_CONTRACT_ADDRESS = "0x4200000000000000000000000000000000000021";

const schemaUID = keccak256(
  encodePacked(
    ["string", "address", "bool"],
    [REPORT_SYBIL_SCHEMA_STRING, zeroAddress, true]
  )
);

export async function verifyReportSybilAttestation({
  attester,
  signer,
  signedAttestation,
}: {
  attester: Address;
  signer: TransactionSigner;
  signedAttestation: SignedOffchainAttestation;
}) {
  // Initialize EAS SDK
  const eas = new EAS(EAS_OP_CONTRACT_ADDRESS, { signer }); // Sepolia address
  const easOffchain = await eas.getOffchain();
  const schemaEncoder = new SchemaEncoder(REPORT_SYBIL_SCHEMA_STRING);
  try {
    const isValid = easOffchain.verifyOffchainAttestationSignature(
      attester,
      signedAttestation
    );

    if (isValid) {
      // Decode the attestation data
      const schemaEncoder = new SchemaEncoder(
        "uint256 reporterFid, uint256 targetFid, bool reportedAsSybil"
      );
      const decodedData = schemaEncoder.decodeData(
        signedAttestation.message.data
      );
    }

    return isValid;
  } catch (error) {
    console.error("Error verifying attestation:", error);
    return false;
  }
}

function computeAttestationUID({
  version,
  schema,
  recipient,
  time,
  expirationTime,
  revocable,
  refUID,
  data,
  salt,
}: OffchainAttestationTypedData) {
  return solidityPackedKeccak256(
    [
      "uint16",
      "bytes",
      "address",
      "address",
      "uint64",
      "uint64",
      "bool",
      "bytes32",
      "bytes",
      "bytes32",
      "uint32",
    ],
    [
      version,
      hexlify(toUtf8Bytes(schema)),
      recipient,
      zeroAddress,
      time,
      expirationTime,
      revocable,
      refUID,
      data,
      salt,
      0,
    ]
  );
}

function splitSignature(signature: `0x${string}`) {
  const sig = signature.slice(2);
  const r = `0x${sig.slice(0, 64)}`;
  const s = `0x${sig.slice(64, 128)}`;
  const v = parseInt(sig.slice(128, 130), 16);
  return { r, s, v };
}

export function useRequestAttestation({
  chainId,
  attester,
}: {
  chainId: number;
  attester: string | undefined;
}) {
  const {
    data: signature,
    signTypedData,
    error,
    isError,
    isPending,
  } = useSignTypedData();

  const signer = useSigner();

  const [attestationData, setAttestationData] =
    useState<SignedOffchainAttestation>({} as SignedOffchainAttestation);

  const schemaEncoder = new SchemaEncoder(REPORT_SYBIL_SCHEMA_STRING);

  const requestAttestation = useCallback(
    (reporterFid: bigint, targetFid: bigint, reportedAsSybil: boolean) => {
      const encodedData = schemaEncoder.encodeData([
        { name: "reporterFid", value: reporterFid, type: "uint256" },
        { name: "targetFid", value: targetFid, type: "uint256" },
        { name: "reportedAsSybil", value: reportedAsSybil, type: "bool" },
      ]);
      if (!attester || !signer) return;

      const domain = {
        name: "EAS Attestation",
        version: "1.0.1",
        chainId,
        verifyingContract: EAS_OP_CONTRACT_ADDRESS as `0x${string}`,
      };

      const primaryType = "Attest";

      const types = {
        Attest: [
          {
            name: "version",
            type: "uint16",
          },
          {
            name: "schema",
            type: "bytes32",
          },
          {
            name: "recipient",
            type: "address",
          },
          {
            name: "time",
            type: "uint64",
          },
          {
            name: "expirationTime",
            type: "uint64",
          },
          {
            name: "revocable",
            type: "bool",
          },
          {
            name: "refUID",
            type: "bytes32",
          },
          {
            name: "data",
            type: "bytes",
          },
          {
            name: "salt",
            type: "bytes32",
          },
        ],
      } as const;

      const message = {
        version: 2,
        schema: schemaUID,
        recipient: zeroAddress,
        time: BigInt(Math.floor(Date.now() / 1000)),
        expirationTime: BigInt(0),
        revocable: true,
        refUID:
          "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`,
        data: encodedData as `0x${string}`,
        salt: "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`,
      };

      setAttestationData({
        domain: { ...domain, chainId: BigInt(domain.chainId) },
        primaryType,
        //@ts-ignore
        types,
        message,
        version: 2,
      });

      signTypedData({
        domain,
        primaryType,
        types,
        message,
      });
    },
    [chainId, signTypedData, attester, signer]
  );

  useEffect(() => {
    if (signature && attestationData.message) {
      const uid = computeAttestationUID({
        ...attestationData.message,
        schema: attestationData.message.schema as `0x${string}`,
        recipient: attestationData.message.recipient as `0x${string}`,
      });
      const { r, s, v } = splitSignature(signature);
      const newAttestationData = {
        ...attestationData,
        signature: { r, s, v },
        uid,
      };
      setAttestationData(newAttestationData);

      if (!attester) {
        console.error("There's no attester");
        return;
      }

      if (!signer) {
        console.error("There's no signer");
        return;
      }
      console.log("verifying if signed attestation is valid...");
      console.log({ newAttestationData });
      verifyReportSybilAttestation({
        attester: attester as `0x${string}`,
        signer,
        signedAttestation: newAttestationData,
      }).then((response) => {
        console.log("is signed attestation valid? ->", response);
      });
    }
  }, [signature, attester, signer]);

  return { requestAttestation, attestationData, error, isError, isPending };
}
