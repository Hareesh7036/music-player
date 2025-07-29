import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { jwt } from "@elysiajs/jwt";
import { staticPlugin } from "@elysiajs/static";
import mongoose from "mongoose";
import { songsRoutes } from "./routes/songs";
import { likesRoutes } from "./routes/likes";
import { authRoutes } from "./routes/authElysia";
import { config } from "./config";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Validate required environment variables
if (!process.env.JWT_SECRET) {
  console.error("❌ JWT_SECRET is not defined in environment variables");
  process.exit(1);
}

// Database connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI environment variable is not set");
    }
    await mongoose.connect(mongoUri);
    console.log("✅ MongoDB Atlas connected successfully");
    console.log("📊 Database:", mongoose.connection.name);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

// Initialize database connection
connectDB();

// Define types for our error response
interface ErrorResponse {
  success: boolean;
  message: string;
  error?: string;
}

const app = new Elysia()
  // Request logging
  .onRequest(({ request }) => {
    console.log(
      `[${new Date().toISOString()}] ${request.method} ${request.url}`
    );
    try {
      const headers: Record<string, string> = {};
      request.headers.forEach((value, key) => {
        headers[key] = value;
      });
      console.log("Headers:", JSON.stringify(headers, null, 2));
    } catch (e) {
      console.error("Error logging headers:", e);
    }
  })

  // Error handling
  .onError(({ code, error, set }): ErrorResponse => {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error(
      `[${new Date().toISOString()}] Error ${code || "UNKNOWN"}:`,
      errorMessage
    );
    if (errorStack) {
      console.error("Stack trace:", errorStack);
    }

    set.status = 500;
    return {
      success: false,
      message: "Internal server error",
      error: errorMessage,
    };
  })
  // Enable CORS
  .use(
    cors({
      credentials: true,
      origin: (request) => {
        const origin = request.headers.get("origin");
        console.log("CORS Origin:", origin);
        if (!origin) return false;
        // Allow localhost and 127.0.0.1 for development
        return origin.includes("localhost") || origin.includes("127.0.0.1");
      },
    })
  )

  // Serve static files
  .use(
    staticPlugin({
      prefix: "/uploads",
      assets: "uploads",
      headers: {
        "Cache-Control": "public, max-age=31536000",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    })
  )

  // JWT Authentication
  .use(
    jwt({
      name: "jwt",
      secret: config.jwtSecret,
    })
  )

  // Application routes
  .use(authRoutes)
  .use(songsRoutes)
  .use(likesRoutes)
  .get("/", () => ({ message: "Music Player API Server" }))
  .get("/health", () => ({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  }));

// Start the server
const port = config.port || 8000;

app
  .listen(port, (server) => {
    console.log(`\n🚀 Server started at ${new Date().toISOString()}`);
    console.log(`🌐 Server running at http://localhost:${port}`);
    console.log(`📚 API Documentation: http://localhost:${port}/docs`);
    console.log(`🔌 Environment: ${config.nodeEnv}`);
    console.log(
      `📊 Database: ${
        mongoose.connection.readyState === 1 ? "Connected" : "Disconnected"
      }`
    );
    console.log("Press Ctrl+C to stop the server\n");

    // Log all registered routes
    console.log("🛣️  Registered routes:");
    app.routes.forEach((route) => {
      console.log(`  ${route.method} ${route.path}`);
    });
    console.log("");
  })
  .on("error", (error) => {
    console.error("❌ Server failed to start:", error);
    process.exit(1);
  });
