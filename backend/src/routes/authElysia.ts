import { Elysia, t } from "elysia";
import { User, IUser } from "../models/User";
import { auth } from "../plugins/auth";
import { Types } from "mongoose";

// ------------------ Type Definitions ------------------
interface AuthBody {
  username?: string;
  email: string;
  password: string;
}

interface UserResponse {
  id: string;
  username: string;
  email: string;
}

interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: UserResponse;
}

// Type guard
function isIUser(user: any): user is IUser & { _id: Types.ObjectId } {
  return (
    user &&
    user._id instanceof Types.ObjectId &&
    typeof user.username === "string" &&
    typeof user.email === "string"
  );
}

// ------------------ Auth Routes ------------------
const app = new Elysia({ prefix: "/api/auth" })
  .decorate("user", undefined as (IUser & { _id: Types.ObjectId }) | undefined)
  .use(auth)
  .onError(({ code, error, set }) => {
    console.error(`[${new Date().toISOString()}] Error:`, code, error);
    set.status = 500;
    return { success: false, message: "An error occurred" };
  });

app.options("/logout", ({ set }) => {
  set.headers = {
    "Access-Control-Allow-Origin": "http://localhost:3000",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
  set.status = 204; // No Content
  return "";
});
// Register route
app.post("/register", async ({ body, set, request }) => {
  const requestId = Math.random().toString(36).substring(2, 10);

  const log = (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    if (data !== undefined) {
      console.log(
        `[${timestamp}] [${requestId}] ${message}`,
        JSON.stringify(data, null, 2)
      );
    } else {
      console.log(`[${timestamp}] [${requestId}] ${message}`);
    }
  };

  try {
    const { username, email, password } = body as AuthBody;

    // Input validation with detailed error messages
    if (!username || !email || !password) {
      const missingFields = [];
      if (!username) missingFields.push("username");
      if (!email) missingFields.push("email");
      if (!password) missingFields.push("password");

      const errorMsg = `Missing required fields: ${missingFields.join(", ")}`;
      console.error("Validation error:", errorMsg);
      set.status = 400;
      return { success: false, message: errorMsg };
    }

    // Input validation
    if (!username || !email || !password) {
      set.status = 400;
      return { success: false, message: "Missing required fields" };
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      set.status = 400;
      return {
        success: false,
        message: "User already exists with this email or username",
      };
    }

    const user = await User.create({ username, email, password });
    const token = user.generateAuthToken();

    return {
      success: true,
      token,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
      },
    };
  } catch (error) {
    log("!!! REGISTRATION ERROR !!!", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      errorObject: error,
    });

    set.status = 500;
    const errorResponse = {
      success: false,
      message: "Server error during registration",
      requestId,
      timestamp: new Date().toISOString(),
    };

    log("Sending error response:", errorResponse);
    return errorResponse;
  }
});

// Login route
app.post("/login", async ({ body, set, request }): Promise<AuthResponse> => {
  try {
    const { email, password } = body as AuthBody;

    if (!email || !password) {
      const missingFields = [];
      if (!email) missingFields.push("email");
      if (!password) missingFields.push("password");

      const errorMsg = `Missing required fields: ${missingFields.join(", ")}`;
      console.error("Validation error:", errorMsg);
      set.status = 400;
      return { success: false, message: errorMsg };
    }
    // Make sure to select the password field which is normally excluded
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      console.log("Login failed: No user found with email:", email);
      set.status = 401;
      return { success: false, message: "Invalid email or password" };
    }

    console.log("Comparing provided password with stored hash...");
    const isMatch = await user.comparePassword(password);
    console.log("Password match:", isMatch);

    if (!isMatch) {
      console.log("Login failed: Incorrect password for user:", email);
      set.status = 401;
      return { success: false, message: "Invalid email or password" };
    }

    const token = user.generateAuthToken();

    return {
      success: true,
      token,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
      },
    };
  } catch (error) {
    console.error("Login error:", error);
    set.status = 500;
    return { success: false, message: "Server error during login" };
  }
});

// Get current user route
app.get("/me", async ({ user, set }): Promise<AuthResponse> => {
  if (!isIUser(user)) {
    set.status = 401;
    return { success: false, message: "Not authorized" };
  }

  return {
    success: true,
    user: {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
    },
  };
});

// Verify token route
app.get("/verify", async ({ user, set }): Promise<AuthResponse> => {
  if (!isIUser(user)) {
    set.status = 401;
    return { success: false, message: "Not authorized" };
  }

  return {
    success: true,
    message: "Token is valid",
    user: {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
    },
  };
});

// Logout route
app.post(
  "/logout",
  async ({ set }) => {
    try {
      set.headers = {
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Credentials": "true",
      };

      return {
        success: true,
        message: "Successfully logged out",
      };
    } catch (error) {
      console.error("Logout error:", error);
      set.status = 500;
      return {
        success: false,
        message: "Error during logout",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
  {
    body: t.Void(), // No body expected
  }
);

export const authRoutes = app;
