import {
  createApiResponse,
  validateQueryParam,
  withErrorHandling,
} from "~/utils/api-helpers";

interface WarpcastUser {
  fid: number;
  fname: string;
  displayName: string;
  imageUrl: string;
}

const GET_USER_BY_FID_ENDPOINT = "https://client.warpcast.com/v2/user-by-fid";
const GET_USER_BY_USERNAME_ENDPOINT =
  "https://client.warpcast.com/v2/user-by-username";
const DEFAULT_IMAGE_URL =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNFMkU4RjAiLz48dGV4dCB4PSIxMDAiIHk9IjEwMCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNDAiIGZpbGw9IiM5NEE3QjkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPj88L3RleHQ+PC9zdmc+";

interface WarpcastResponse {
  result: {
    user: {
      fid: number;
      username: string;
      displayName: string;
      pfp: {
        url: string;
      };
    };
  };
}

const validateFid = (value: string): boolean => {
  const numValue = parseInt(value);
  return !isNaN(numValue) && /^-?\d*\.?\d+$/.test(value);
};

async function fetchWarpcastUser(identifier: string): Promise<WarpcastUser> {
  const isFid = validateFid(identifier);
  const endpoint = isFid
    ? `${GET_USER_BY_FID_ENDPOINT}?fid=${identifier}`
    : `${GET_USER_BY_USERNAME_ENDPOINT}?username=${identifier}`;

  const response = await fetch(endpoint);

  if (!response.ok) {
    console.error("Warpcast API error:", response.status, response.statusText);
    throw new Error("Failed to fetch user data");
  }

  const data = (await response.json()) as WarpcastResponse;
  return {
    fid: data.result.user.fid,
    fname: data.result.user.username,
    displayName: data.result.user.displayName,
    imageUrl: data.result.user.pfp?.url ?? DEFAULT_IMAGE_URL,
  };
}

const handler = async (request: Request): Promise<Response> => {
  const { searchParams } = new URL(request.url);
  const identifier = validateQueryParam(searchParams, "identifier");
  const userData = await fetchWarpcastUser(identifier);
  return Response.json(createApiResponse(userData));
};

export const GET = withErrorHandling(handler);
