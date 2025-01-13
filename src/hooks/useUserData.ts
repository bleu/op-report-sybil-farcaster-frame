"use client";

import useSWR, { SWRResponse } from "swr";

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

async function fetchFarcasterUserData(identifier: string): Promise<{
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

async function fetchSybilProbability(fid: number): Promise<{
  sybilProbability: number | undefined;
  humanReports: number | undefined;
  sybilReports: number | undefined;
}> {
  try {
    const response = await fetch(`/api/check-sybil?fid=${fid}`);

    if (!response.ok) {
      return {
        sybilProbability: undefined,
        humanReports: undefined,
        sybilReports: undefined,
      };
    }

    const data = await response.json();
    return {
      sybilProbability: data.data.sybilProbability,
      humanReports: data.data.humanReports,
      sybilReports: data.data.sybilReports,
    };
  } catch (e) {
    return {
      sybilProbability: undefined,
      humanReports: undefined,
      sybilReports: undefined,
    };
  }
}

async function fetchUserData(identifier: string): Promise<UserData> {
  const userData = await fetchFarcasterUserData(identifier);
  if (userData === null)
    throw new Error("Couldn't fetch user's Farcaster data in fetchUserData");
  const { fid } = userData;

  const sybilProbability = await fetchSybilProbability(fid);

  return {
    ...userData,
    ...sybilProbability,
  };
}

export function useUserData(
  identifier: string | null
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
