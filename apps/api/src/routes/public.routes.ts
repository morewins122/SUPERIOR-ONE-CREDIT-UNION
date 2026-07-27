import { Router } from "express";

export const publicRouter = Router();

publicRouter.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    app: "Superior One Credit Union",
    disclaimer: "Secure online banking services for members."
  });
});

publicRouter.get("/faq", (_req, res) => {
  res.json([
    { q: "Is this real banking?", a: "Yes. Superior One provides digital account and lending services." },
    { q: "Are funds real?", a: "Account balances and transactions reflect your banking activity." },
    { q: "Can I use this for production?", a: "Yes. This platform is intended for operational banking workflows." }
  ]);
});
