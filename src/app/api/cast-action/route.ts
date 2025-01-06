import { frame } from "~/app/page";

// Types for our responses
interface GetActionResponse {
  actionUrl?: string;
  name?: string;
  icon?: string;
  description?: string;
  aboutUrl?: string;
  action?: {
    type?: string;
  };
  error?: string;
}

interface PostActionRequest {
  castHash: string;
  // Add other request fields if needed
}

interface PostActionResponse {
  type?: string;
  castHash?: string;
  frame?: typeof frame;
  message?: string;

  error?: string;
}

// GET endpoint handler
export async function GET(request: Request): Promise<Response> {
  try {
    const response: GetActionResponse = {
      actionUrl: "https://jean.ngrok.app/api/cast-action",
      name: "Check Sybil",
      icon: "dependabot",
      description: "Check Sybil users and report them",
      aboutUrl: "https://jean.ngrok.app/",
      action: {
        type: "post",
      },
    };

    return Response.json(response);
  } catch (error) {
    console.error("Error in GET /api/cast-action:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST endpoint handler
export async function POST(request: Request): Promise<Response> {
  try {
    // Parse the request body
    const body: PostActionRequest = await request.json();
    const { castHash } = body;

    if (!castHash) {
      return Response.json({ error: "castHash is required" }, { status: 400 });
    }

    const response: PostActionResponse = {
      type: "frame",
      castHash: castHash,
      frame: frame,
      message: "Multi-step actions not yet supported",
    };

    return Response.json(response);
  } catch (error) {
    console.error("Error in POST /api/cast-action:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Optional: Middleware to handle CORS if needed
export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
