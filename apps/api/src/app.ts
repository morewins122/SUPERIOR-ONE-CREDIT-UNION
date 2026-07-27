import cookieParser from "cookie-parser";
import cors from "cors";
import csrf from "csurf";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { env } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/error.js";
import { accountRouter } from "./routes/accounts.routes.js";
import { adminRouter } from "./routes/admin.routes.js";
import { authRouter } from "./routes/auth.routes.js";
import { cardRouter } from "./routes/cards.routes.js";
import { dashboardRouter } from "./routes/dashboard.routes.js";
import { loanRouter } from "./routes/loans.routes.js";
import { profileRouter } from "./routes/profile.routes.js";
import { publicRouter } from "./routes/public.routes.js";
import { transactionRouter } from "./routes/transactions.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.WEB_URL,
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true
});

app.use("/api", apiLimiter);
app.use("/api/auth", authLimiter);

const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production"
  }
});

app.use("/api/public", publicRouter);
app.use("/api/auth", csrfProtection, authRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/accounts", accountRouter);
app.use("/api/transactions", transactionRouter);
app.use("/api/cards", cardRouter);
app.use("/api/loans", loanRouter);
app.use("/api/profile", profileRouter);
app.use("/api/admin", adminRouter);

app.use(notFound);
app.use(errorHandler);
