import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePortalUX } from "@/context/PortalUXContext";
import { DEMO_AUTH_CREDENTIALS } from "@/data/bankDemoData";

const homepageLoginSchema = z.object({
  userId: z.string().min(1, "Please enter your User ID."),
  password: z.string().min(1, "Please enter your password."),
  rememberMe: z.boolean().default(false)
});

type HomepageLoginFormValues = z.infer<typeof homepageLoginSchema>;
type PendingCredentials = Pick<HomepageLoginFormValues, "userId" | "password" | "rememberMe">;

export function HomepageLoginPanel() {
  const { login } = useAuth();
  const { navigatePage } = usePortalUX();
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [authStep, setAuthStep] = useState<"credentials" | "loading" | "verification">("credentials");
  const [pendingCredentials, setPendingCredentials] = useState<PendingCredentials | null>(null);
  const [twoFactorPin, setTwoFactorPin] = useState("");
  const [showPinHint, setShowPinHint] = useState(false);
  const [twoFactorError, setTwoFactorError] = useState<string | null>(null);

  // Form setup with Zod validation for accessible, user-friendly messages.
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<HomepageLoginFormValues>({
    resolver: zodResolver(homepageLoginSchema),
    defaultValues: {
      userId: "",
      password: "",
      rememberMe: false
    }
  });

  const isCredentialValid = (values: HomepageLoginFormValues) => {
    const username = values.userId.trim();
    const password = values.password;
    return username === DEMO_AUTH_CREDENTIALS.username && password === DEMO_AUTH_CREDENTIALS.password;
  };

  const completeSignInAfterVerification = async () => {
    if (!pendingCredentials) {
      return;
    }

    setSubmitError(null);
    setShowWelcome(true);

    try {
      await new Promise<void>((resolve) => window.setTimeout(resolve, 10000));
      await login(pendingCredentials.userId, pendingCredentials.password, undefined, pendingCredentials.rememberMe);
      await navigatePage("/dashboard.html", {
        durationMs: 900,
        message: "Finalizing sign in...",
        title: "Dashboard",
        skeleton: "dashboard"
      });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Invalid username or password.");
      setShowWelcome(false);
      setAuthStep("credentials");
      setPendingCredentials(null);
      setTwoFactorPin("");
    }
  };

  // Credentials step validates sign-on first, then sends user to second-factor verification.
  const onSubmit = async (values: HomepageLoginFormValues) => {
    setSubmitError(null);

    if (!isCredentialValid(values)) {
      setSubmitError("Invalid username or password.");
      return;
    }

    setPendingCredentials({ userId: values.userId, password: values.password, rememberMe: values.rememberMe });
    setTwoFactorPin("");
    setTwoFactorError(null);
    setShowPinHint(false);

    setAuthStep("loading");
    window.setTimeout(() => {
      setAuthStep("verification");
    }, 10000);
  };

  const handlePinDigit = (digit: string) => {
    setTwoFactorError(null);
    setTwoFactorPin((current) => (current.length >= 4 ? current : `${current}${digit}`));
  };

  const handlePinDelete = () => {
    setTwoFactorError(null);
    setTwoFactorPin((current) => current.slice(0, -1));
  };

  const handleTwoFactorConfirm = async () => {
    if (twoFactorPin.length < 4) {
      setTwoFactorError("Enter all 4 PIN digits to continue.");
      return;
    }

    if (twoFactorPin !== "1986") {
      setTwoFactorError("Incorrect PIN. Please try again.");
      setTwoFactorPin("");
      return;
    }

    await completeSignInAfterVerification();
  };

  const canProceedWithPin = twoFactorPin.length === 4 && !showWelcome;

  return (
    <aside className="relative w-full rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200 sm:p-7 lg:sticky lg:top-28" aria-labelledby="member-signin-title">
      {/* Brand header for a banking portal feel. */}
      <div className="mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0f5f57]">Superior One Credit Union</p>
          <h2 id="member-signin-title" className="text-lg font-bold text-slate-900">
            Sign On
          </h2>
        </div>
      </div>

      {authStep === "credentials" ? (
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div>
            <label htmlFor="homepage-username" className="mb-1 block text-sm font-medium text-slate-700">
              Username
            </label>
            <input
              id="homepage-username"
              type="text"
              autoComplete="username"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-[#0f5f57] focus:ring-2 focus:ring-[#0f5f571f]"
              aria-invalid={errors.userId ? "true" : "false"}
              {...register("userId")}
            />
            {errors.userId && <p className="mt-1 text-sm text-red-600">{errors.userId.message}</p>}
          </div>

          <div>
            <label htmlFor="homepage-password" className="mb-1 block text-sm font-medium text-slate-700">
              Password
            </label>
            <div className="relative">
              <input
                id="homepage-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 pr-12 text-slate-900 outline-none transition focus:border-[#0f5f57] focus:ring-2 focus:ring-[#0f5f571f]"
                aria-invalid={errors.password ? "true" : "false"}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute inset-y-0 right-2 my-auto inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0f5f571f]"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <label htmlFor="homepage-remember-me" className="inline-flex min-h-11 items-center gap-2 text-sm text-slate-700">
              <input
                id="homepage-remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-[#0f5f57] focus:ring-[#0f5f57]"
                {...register("rememberMe")}
              />
                Remember User ID
            </label>
                <Link className="min-h-11 text-sm font-medium leading-5 text-[#0f5f57] hover:text-[#0c4f48]" to="/forgot-password">
                  Forgot User ID/Password?
            </Link>
          </div>

          {submitError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{submitError}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0f5f57] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0c4f48] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
            {isSubmitting ? "Signing On..." : "Sign On"}
          </button>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pt-1 text-sm">
            <Link to="/forgot-password" className="min-h-11 font-medium text-[#0f5f57] hover:text-[#0c4f48]">
              Forgot User ID/Password?
            </Link>
            <span aria-hidden="true" className="text-slate-300">|</span>
            <Link to="/register" className="min-h-11 font-medium text-[#0f5f57] hover:text-[#0c4f48]">
              Enroll
            </Link>
          </div>
        </form>
      ) : authStep === "loading" ? (
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-[#f8fbff] p-6 text-center sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2e568d]">Signing in</p>
          <h3 className="text-3xl font-bold leading-tight text-[#173f74] sm:text-[2.25rem]">Loading your secure access</h3>
          <p className="text-base text-[#305482] sm:text-lg">Please wait while we prepare your PIN verification screen.</p>
          <div className="flex items-center justify-center gap-2 pt-2 text-sm text-slate-500">
            <Loader2 size={16} className="animate-spin" />
            Verifying credentials...
          </div>
          <div className="mx-auto h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-slate-200/80">
            <div className="h-full w-1/2 animate-[pulse_1.1s_ease-in-out_infinite] rounded-full bg-[#0f5f57]" />
          </div>
        </div>
      ) : (
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-[#f8fbff] p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2e568d]">Secure Verification Check</p>
          <h3 className="text-3xl font-bold leading-tight text-[#173f74] sm:text-[2.25rem]">Verify Your Identity</h3>
          <p className="text-base text-[#305482] sm:text-lg">Enter the 4-digit PIN sent to your registered device to continue your secure sign on.</p>

          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, index) => {
              const digit = twoFactorPin[index];
              return (
                <div key={`pin-slot-${index}`} className="flex h-16 items-center justify-center rounded-full border-2 border-[#c2d3ef] bg-white text-2xl font-semibold text-[#173f74]">
                  {digit ? "•" : ""}
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowPinHint((value) => !value)}
              className="rounded-xl border border-[#bfd2ef] bg-white px-5 py-3 text-sm font-semibold text-[#173f74] transition hover:bg-[#f2f7ff]"
            >
              {showPinHint ? "Hide PIN" : "Show PIN"}
            </button>
            {showPinHint ? <p className="text-sm font-semibold text-[#173f74]">Demo PIN: 1986</p> : null}
          </div>

          <div className="grid grid-cols-3 gap-3">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handlePinDigit(digit)}
                className="h-16 rounded-2xl border border-[#b6ccee] bg-white text-2xl font-semibold text-[#173f74] transition hover:bg-[#edf4ff]"
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              onClick={handlePinDelete}
              className="h-16 rounded-2xl border border-[#b6ccee] bg-white text-xl font-semibold text-[#6c86ae] transition hover:bg-[#edf4ff]"
            >
              Delete
            </button>
            <button
              type="button"
              onClick={() => handlePinDigit("0")}
              className="h-16 rounded-2xl border border-[#b6ccee] bg-white text-2xl font-semibold text-[#173f74] transition hover:bg-[#edf4ff]"
            >
              0
            </button>
            <button
              type="button"
              disabled={!canProceedWithPin}
              onClick={() => void handleTwoFactorConfirm()}
              className="h-16 rounded-2xl border text-xl font-semibold transition disabled:cursor-not-allowed disabled:border-[#d7e3f6] disabled:bg-[#f5f8fe] disabled:text-[#9fb2cf] enabled:cursor-pointer enabled:border-[#8fb3e4] enabled:bg-[#e8f1ff] enabled:text-[#1f4f88] enabled:hover:bg-[#dceafe]"
            >
              Verify
            </button>
          </div>

          {twoFactorError ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{twoFactorError}</p> : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              disabled={showWelcome}
              onClick={() => {
                setAuthStep("credentials");
                setTwoFactorError(null);
                setTwoFactorPin("");
                setShowPinHint(false);
              }}
              className="h-14 rounded-2xl border border-[#b6ccee] bg-white px-4 text-xl font-semibold text-[#173f74] transition hover:bg-[#edf4ff] disabled:opacity-60"
            >
              Back
            </button>
            <button
              type="button"
              disabled={!canProceedWithPin}
              onClick={() => void handleTwoFactorConfirm()}
              className="h-14 rounded-2xl px-4 text-xl font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-[#9dbcb8] disabled:opacity-75 enabled:cursor-pointer enabled:bg-[#4f8f88] enabled:hover:bg-[#3f7e78]"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {showWelcome ? (
        <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-white/90 backdrop-blur-sm">
          <div className="animate-[fadeScale_0.35s_ease-out] rounded-[20px] bg-white px-6 py-8 text-center shadow-2xl ring-1 ring-slate-200">
            <h3 className="text-2xl font-bold text-slate-900">Signing in...</h3>
            <div className="mt-4 inline-flex items-center gap-2 text-sm text-slate-500">
              <Loader2 size={16} className="animate-spin" />
              Loading your account
            </div>
            <div className="mt-5 h-1.5 w-56 overflow-hidden rounded-full bg-slate-200/80">
              <div className="h-full w-1/2 animate-[pulse_1.1s_ease-in-out_infinite] rounded-full bg-[#0f5f57]" />
            </div>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
