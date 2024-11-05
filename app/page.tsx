import { getFrameMetadata } from "frog/web";
import type { Metadata } from "next";

import styles from "./page.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const frameTags = await getFrameMetadata(
    `${process.env.VERCEL_URL || "https://jean.ngrok.app"}/api`
  );
  return {
    other: frameTags,
  };
}

export default function Home() {
  return <main className={styles.main}>vercel app</main>;
}
