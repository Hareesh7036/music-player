import { Elysia } from "elysia";
import jwt from "jsonwebtoken";
import { User, IUser } from "../models/User";
import { config } from "../config";

// Define the type for our auth context
type AuthContext = {
  user: IUser;
};

export const auth = new Elysia({ name: "auth" }).derive(
  async ({
    request,
    set,
    cookie: { auth },
    path,
  }): Promise<{ user?: IUser }> => {
    // // Skip auth for logout endpoint
    // if (path === '/api/auth/logout') {
    //   console.log('Skipping auth for logout endpoint');
    //   return { user: undefined };
    // }

    const token = auth.value;

    if (!token) {
      console.log("No token found in cookies");
      return { user: undefined };
    }

    try {
      console.log("Verifying token...");

      // Verify the token using the same secret used for signing
      const decoded = jwt.verify(token, config.jwtSecret) as {
        id: string;
        email: string;
      };
      console.log("Decoded token:", JSON.stringify(decoded, null, 2));

      if (!decoded || !decoded.id) {
        console.error("Invalid token payload - missing id");
        return { user: undefined };
      }

      console.log(`Looking up user with ID: ${decoded.id}`);
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        console.error("User not found for ID:", decoded.id);
        return { user: undefined };
      }

      console.log("User found and authenticated:", user.email);
      return { user };
    } catch (error) {
      console.error("Token verification error:", error);
      return { user: undefined };
    }
  }
);
