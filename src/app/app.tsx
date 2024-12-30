"use client";

import dynamic from "next/dynamic";

const Frontend = dynamic(() => import("~/components/Frontend"), {
  ssr: false,
});

export default function App(
  { title }: { title?: string } = { title: "Check Sybil" }
) {
  return <Frontend title={title} />;
}
