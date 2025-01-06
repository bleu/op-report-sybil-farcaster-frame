const GET_USER_BY_FID_ENDPOINT = "https://client.warpcast.com/v2/user-by-fid";
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fidParam = searchParams.get("fid");

    if (!fidParam) {
      return Response.json(
        {
          success: false,
          error: "FID parameter is required",
        },
        { status: 400 }
      );
    }

    const fid = parseInt(fidParam);
    if (isNaN(fid)) {
      return Response.json(
        {
          success: false,
          error: "Invalid FID format",
        },
        { status: 400 }
      );
    }
    const response = await fetch(`${GET_USER_BY_FID_ENDPOINT}?fid=${fid}`);

    if (!response.ok) {
      console.error(
        "Warpcast API error:",
        response.status,
        response.statusText
      );
      return Response.json(
        {
          success: false,
          error: "Failed to fetch user data",
        },
        { status: response.status }
      );
    }

    const data = (await response.json()) as WarpcastResponse;
    const fname = data.result.user.username ?? "";
    const displayName = data.result.user.displayName ?? "";
    const imageUrl = data.result.user.pfp
      ? data.result.user.pfp.url
      : DEFAULT_IMAGE_URL;
    return Response.json({
      success: true,
      data: {
        fid,
        fname,
        displayName,
        imageUrl,
      },
    });
  } catch (e) {
    console.error("Error in fetchFarcasterUserData:", e);
    return Response.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
