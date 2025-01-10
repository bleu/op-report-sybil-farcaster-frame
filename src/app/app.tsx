"use client";

import { getSession } from "~/auth";
import { Providers } from "~/app/providers";
import dynamic from "next/dynamic";

const Frontend = dynamic(() => import("~/components/Frontend"), {
  ssr: false,
});

export default async function App(
  { title }: { title?: string } = { title: "Check Sybil" }
) {
  const session = await getSession();

  return (
    <Providers session={session}>
      <Frontend title={title} />
    </Providers>
  );
}
