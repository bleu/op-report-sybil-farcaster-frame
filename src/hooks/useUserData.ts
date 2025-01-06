"use client";

import useSWR, { SWRResponse } from "swr";

const SYBIL_PROBABILITY_ENDPOINT =
  process.env.NEXT_PUBLIC_SYBIL_PROBABILITY_ENDPOINT ??
  "https://127.0.0.1:3000/check-sybil";

interface UserData {
  fid: number;
  fname: string;
  displayName: string;
  imageUrl: string;
  sybilReports: number | undefined;
  humanReports: number | undefined;
  sybilProbability: number | undefined;
}

interface FetchError extends Error {
  source: "farcaster" | "sybil" | "humanReports" | "sybilReports";
  status?: number;
}

async function fetchFarcasterUserData(identifier: number | string): Promise<{
  fid: number;
  fname: string;
  displayName: string;
  imageUrl: string;
} | null> {
  try {
    const response = await fetch(
      `/api/get-farcaster-user-data?identifier=${identifier}`
    );

    if (!response.ok) {
      console.error(response);
      return null;
    }

    const data = await response.json();
    return data.data as {
      fid: number;
      fname: string;
      displayName: string;
      imageUrl: string;
    };
  } catch (e) {
    console.error("Error in fetchFarcasterUserData:", e);
    return null;
  }
}

async function fetchReports(fid: number): Promise<{
  humanReports: number | undefined;
  sybilReports: number | undefined;
}> {
  try {
    const response = await fetch(`/api/get-reports?fid=${fid}`);

    if (!response.ok) {
      return {
        humanReports: undefined,
        sybilReports: undefined,
      };
    }

    const data = (await response.json()).data as {
      humanReports: number;
      sybilReports: number;
    };
    return data;
  } catch (e) {
    console.error("Error in fetchReports:", e);
    return {
      humanReports: undefined,
      sybilReports: undefined,
    };
  }
}

async function fetchSybilProbability(fid: number): Promise<{
  sybilProbability: number | undefined;
}> {
  try {
    const response = await fetch(`${SYBIL_PROBABILITY_ENDPOINT}/${fid}`);

    if (!response.ok) {
      return { sybilProbability: undefined };
    }

    const data = await response.json();
    return data.numeric_output;
  } catch (e) {
    return { sybilProbability: undefined };
  }
}

async function fetchUserData(identifier: number | string): Promise<UserData> {
  const userData = await fetchFarcasterUserData(identifier);
  if (userData === null)
    throw new Error("Couldn't fetch user's Farcaster data in fetchUserData");
  const { fid } = userData;

  const [reports, sybilProbability] = await Promise.all([
    fetchReports(fid),
    fetchSybilProbability(fid),
  ]);

  return {
    ...userData,
    ...reports,
    ...sybilProbability,
  };
}

export function useUserData(
  identifier: number | string | null
): SWRResponse<UserData, FetchError> {
  return useSWR<UserData, FetchError>(
    identifier ? [identifier] : null,
    fetchUserData,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    }
  );
}
