import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:5173",
  "https://gen-ai-nine-sigma.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (Postman, mobile apps, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.static("public"));

/* Routes */
import authRouter from "./routes/auth.routes.js";
import interviewRouter from "./routes/interview.routes.js";
import mockInterviewRouter from "./routes/mockInterview.route.js";

app.use("/api/auth", authRouter);
app.use("/api/interview", interviewRouter);
app.use("/api/mock-interview", mockInterviewRouter);

export default app;