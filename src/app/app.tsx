"use client";

import dynamic from "next/dynamic";

const Frontend = dynamic(() => import("~/components/Frontend"), {
  ssr: false,
});

const WagmiProvider = dynamic(
  () => import("~/components/providers/WagmiProvider"),
  {
    ssr: false,
  }
);

export default function App(
  { title }: { title?: string } = { title: "Check Sybil" }
) {
  return (
    <WagmiProvider>
      <Frontend title={title} />
    </WagmiProvider>
  );
}
