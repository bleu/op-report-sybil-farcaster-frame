import { header } from "~/utils/consts";

function logEncoding() {
  const appUrl = process.env.NEXT_PUBLIC_URL;

  const payload = JSON.stringify({ domain: appUrl?.split("//").at(-1) });

  const headerBtoa = btoa(header);
  const payloadBtoa = btoa(payload);

  const headerBuffer = Buffer.from(JSON.stringify(header), "utf-8").toString(
    "base64url"
  );
  const payloadBuffer = Buffer.from(JSON.stringify(payload), "utf-8").toString(
    "base64url"
  );
  const signatureBuffer = Buffer.from(
    "0x32a91c7fe30a2940c53e304dab5033325421e7b65c3284e03a315d0303e23df63abaf910b0917c6f28c94f8135c823813aea460fa2604131ce447ebd24b92ab11b",
    "utf-8"
  ).toString("base64url");

  console.log({
    appUrl,
    headerBtoa,
    payloadBtoa,
    headerBuffer,
    payloadBuffer,
    signatureBuffer,
  });
}

logEncoding();

export default function Page() {
  return <div>Hello world</div>;
}
