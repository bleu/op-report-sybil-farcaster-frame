import {
  EAS,
  SchemaEncoder,
  type SignedOffchainAttestation,
  EASOptions,
  TransactionSigner,
} from "@ethereum-attestation-service/eas-sdk";
import { JsonRpcProvider, Signer, Wallet } from "ethers";
import { type Address, encodePacked, keccak256, zeroAddress } from "viem";
import { arbitrum, gnosis, mainnet, optimism } from "viem/chains";

const EAS_OP_CONTRACT_ADDRESS = "0x4200000000000000000000000000000000000021";
const REPORT_SYBIL_SCHEMA_STRING =
  "uint256 reporterFid, uint256 targetFid, bool reportedAsSybil";

export function generateEncryptedCaptchaText() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return encryptCaptchaChallenge(result);
}

export function generateRandomFontSize() {
  const sizes = [64, 72, 80];
  return sizes[Math.floor(Math.random() * sizes.length)];
}

export function generateRandomAngle() {
  return Math.floor(Math.random() * 91) - 45;
}

export function encryptCaptchaChallenge(captchaToEncode: string): string {
  if (!captchaToEncode!) {
    throw new Error("CAPTCHA to encode must not be empty");
  }

  const key = process.env.CAPTCHA_ENCRYPTION_KEY;
  if (!key) {
    console.error(
      "Required env variable CAPTCHA_ENCRYPTION_KEY was not found!"
    );
    throw new Error(
      "Required env variable CAPTCHA_ENCRYPTION_KEY was not found!"
    );
  }

  let result = "";
  for (let i = 0; i < captchaToEncode.length; i++) {
    // Get the shift amount from the current key character (using modulo to wrap around)
    const shift = key.charCodeAt(i % key.length) % 26;
    const charCode = captchaToEncode.charCodeAt(i);

    // Shift the character and wrap around if necessary
    let newCharCode = charCode + shift;

    // Keep within printable ASCII range (33-126)
    if (newCharCode > 126) {
      newCharCode = 33 + (newCharCode - 127);
    }

    result += String.fromCharCode(newCharCode);
  }

  return encodeURIComponent(result);
}

export function decryptCaptchaChallenge(encryptedCaptcha: string): string {
  if (!encryptedCaptcha!) {
    throw new Error("Encoded CAPTCHA must not be empty");
  }

  const key = process.env.CAPTCHA_ENCRYPTION_KEY;
  if (!key) {
    console.error(
      "Required env variable CAPTCHA_ENCRYPTION_KEY was not found!"
    );
    throw new Error(
      "Required env variable CAPTCHA_ENCRYPTION_KEY was not found!"
    );
  }

  const encryptedCaptchaString = decodeURIComponent(encryptedCaptcha);

  let result = "";
  for (let i = 0; i < encryptedCaptchaString.length; i++) {
    // Get the shift amount from the current key character
    const shift = key.charCodeAt(i % key.length) % 26;
    const charCode = encryptedCaptchaString.charCodeAt(i);

    // Reverse the shift and wrap around if necessary
    let newCharCode = charCode - shift;

    // Keep within printable ASCII range (33-126)
    if (newCharCode < 33) {
      newCharCode = 126 - (33 - newCharCode - 1);
    }

    result += String.fromCharCode(newCharCode);
  }

  return result;
}

export async function createReportSybilAttestation(
  reporterFid: bigint,
  targetFid: bigint,
  reportedAsSybil: boolean
) {
  console.log({ privateKey: process.env.NEXT_PUBLIC_TEST_PRIVATE_KEY });
  if (!process.env.NEXT_PUBLIC_TEST_PRIVATE_KEY)
    throw new Error("Provide a private key in env");

  try {
    // Initialize provider and signer
    const provider = new JsonRpcProvider(process.env.NEXT_PUBLIC_OP_RPC_URL);
    console.log({ provider });
    const signer = new Wallet(
      process.env.NEXT_PUBLIC_TEST_PRIVATE_KEY,
      provider
    );

    // Initialize EAS SDK
    const eas = new EAS(EAS_OP_CONTRACT_ADDRESS, { signer });
    const easOffchain = await eas.getOffchain();
    eas.connect(signer);

    const schemaEncoder = new SchemaEncoder(REPORT_SYBIL_SCHEMA_STRING);

    // Encode the attestation data
    console.log({ reporterFid, targetFid, reportedAsSybil });
    const encodedData = schemaEncoder.encodeData([
      { name: "reporterFid", value: reporterFid, type: "uint256" },
      { name: "targetFid", value: targetFid, type: "uint256" },
      { name: "reportedAsSybil", value: reportedAsSybil, type: "bool" },
    ]);

    // Generate schema UID for off-chain use
    const schemaUID = keccak256(
      encodePacked(
        ["string", "address", "bool"],
        [REPORT_SYBIL_SCHEMA_STRING, zeroAddress, true]
      )
    );

    console.log({ encodedData });

    const attestation = {
      schema: schemaUID,
      recipient: zeroAddress, // TODO: make this to be the address linked to farcaster account of targetFid
      time: BigInt(Math.floor(Date.now() / 1000)),
      expirationTime: BigInt(0),
      revocable: true,
      data: encodedData,
      refUID:
        "0x0000000000000000000000000000000000000000000000000000000000000000",
    };
    console.log({ attestation });

    // Sign the attestation
    const signedAttestation = await easOffchain.signOffchainAttestation(
      attestation,
      signer
    );

    console.log("Schema UID:", schemaUID);
    console.log("Off-chain Attestation UID:", signedAttestation.uid);
    console.log("Signed Attestation:", signedAttestation);

    return { attester: signer.address.toLowerCase(), signedAttestation };
  } catch (e) {
    console.log("Error creating attestation:", e);
  }
}

// Function to verify and decode a sybil report attestation
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

  try {
    const isValid = easOffchain.verifyOffchainAttestationSignature(
      attester,
      signedAttestation
    );
    console.log("Attestation is valid:", isValid);

    if (isValid) {
      // Decode the attestation data
      const schemaEncoder = new SchemaEncoder(
        "uint256 reporterFid, uint256 targetFid, bool reportedAsSybil"
      );
      const decodedData = schemaEncoder.decodeData(
        signedAttestation.message.data
      );

      console.log("Decoded Sybil Report:", {
        reporterFid: decodedData[0].value.toString(), // Convert BigInt to string
        targetFid: decodedData[1].value.toString(),
        reportedAsSybil: decodedData[2].value,
      });
    }

    return isValid;
  } catch (error) {
    console.error("Error verifying attestation:", error);
    return false;
  }
}
