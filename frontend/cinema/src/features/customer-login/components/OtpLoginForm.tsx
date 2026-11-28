"use client";

import { ApiError } from "@luch/shared/api";
import { joinClassNames } from "@luch/shared/lib";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ROUTES } from "@/shared/config";
import { Button, MONO_LABEL_CLASS_NAME, PANEL_CLASS_NAME } from "@/shared/ui";
import { useRequestOtp, useVerifyOtp } from "@/entities/customer";
import { CUSTOMER_LOGIN_TEXT, OTP_RESEND_SECONDS } from "@/features/customer-login/constants/customer-login.constant";
import { requestOtpSchema, verifyOtpSchema } from "@/features/customer-login/schemas/customer-login.schema";

const INPUT_CLASS_NAME =
  "w-full rounded-frame border border-paper/18 bg-ink px-3.5 py-3 text-base text-paper placeholder:text-paper/32 focus:border-warm focus:outline-none";

const getSafeNextRoute = (nextParam: string | null): string => {
  if (!nextParam || !nextParam.startsWith("/") || nextParam.startsWith("//")) return ROUTES.cabinet;

  return nextParam;
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    const fieldMessages = Object.values(error.fieldErrors).flat();

    return fieldMessages[0] ?? error.message;
  }

  return CUSTOMER_LOGIN_TEXT.fallbackError;
};

export const OtpLoginForm = () => {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendLeft, setResendLeft] = useState(0);

  const requestOtp = useRequestOtp();
  const verifyOtp = useVerifyOtp();

  useEffect(() => {
    if (resendLeft <= 0) return;

    const timer = setInterval(() => {
      setResendLeft((current) => Math.max(0, current - 1));
    }, 1_000);

    return () => clearInterval(timer);
  }, [resendLeft]);

  const handleRequestCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    const parsed = requestOtpSchema.safeParse({ email });
    if (!parsed.success) {
      setErrorMessage(parsed.error.issues[0]?.message ?? CUSTOMER_LOGIN_TEXT.validationEmail);

      return;
    }

    try {
      await requestOtp.mutateAsync(parsed.data.email);
      setEmail(parsed.data.email);
      setCode("");
      setStep("code");
      setResendLeft(OTP_RESEND_SECONDS);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  };

  const handleResend = async () => {
    if (resendLeft > 0) return;
    setErrorMessage(null);
    try {
      await requestOtp.mutateAsync(email);
      setResendLeft(OTP_RESEND_SECONDS);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  };

  const handleVerifyCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    const parsed = verifyOtpSchema.safeParse({ code });
    if (!parsed.success) {
      setErrorMessage(parsed.error.issues[0]?.message ?? CUSTOMER_LOGIN_TEXT.validationCode);

      return;
    }

    try {
      await verifyOtp.mutateAsync({ email, code: parsed.data.code });
      window.location.assign(getSafeNextRoute(searchParams.get("next")));
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  };

  return (
    <div className={joinClassNames(PANEL_CLASS_NAME, "mx-auto grid max-w-md gap-6 bg-ink-2 p-6 sm:p-8")}>
      <div className="grid gap-2">
        <span className={MONO_LABEL_CLASS_NAME}>{CUSTOMER_LOGIN_TEXT.eyebrow}</span>
        <h1 className="font-display text-4xl leading-none font-medium uppercase">{CUSTOMER_LOGIN_TEXT.title}</h1>
        <p className="text-sm text-paper/64">
          {step === "email" ? CUSTOMER_LOGIN_TEXT.emailSubtitle : CUSTOMER_LOGIN_TEXT.codeSubtitle(email)}
        </p>
      </div>

      {step === "email" ? (
        <form onSubmit={(event) => void handleRequestCode(event)} noValidate className="grid gap-4">
          <label className="grid gap-1.5 text-sm">
            <span className="text-paper/72">{CUSTOMER_LOGIN_TEXT.emailLabel}</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={CUSTOMER_LOGIN_TEXT.emailPlaceholder}
              className={INPUT_CLASS_NAME}
            />
          </label>
          {errorMessage && <p className="text-sm text-signal">{errorMessage}</p>}
          <Button type="submit" disabled={requestOtp.isPending}>
            {requestOtp.isPending ? CUSTOMER_LOGIN_TEXT.sendingCodeButton : CUSTOMER_LOGIN_TEXT.sendCodeButton}
          </Button>
        </form>
      ) : (
        <form onSubmit={(event) => void handleVerifyCode(event)} noValidate className="grid gap-4">
          <label className="grid gap-1.5 text-sm">
            <span className="text-paper/72">{CUSTOMER_LOGIN_TEXT.codeLabel}</span>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder={CUSTOMER_LOGIN_TEXT.codePlaceholder}
              className={joinClassNames(INPUT_CLASS_NAME, "font-mono text-2xl tracking-[0.35em] text-center")}
            />
          </label>
          {errorMessage && <p className="text-sm text-signal">{errorMessage}</p>}
          <Button type="submit" disabled={verifyOtp.isPending}>
            {verifyOtp.isPending ? CUSTOMER_LOGIN_TEXT.verifyingButton : CUSTOMER_LOGIN_TEXT.verifyButton}
          </Button>
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
            <button
              type="button"
              onClick={() => {
                setStep("email");
                setErrorMessage(null);
              }}
              className="text-paper/64 transition-colors hover:text-paper"
            >
              {CUSTOMER_LOGIN_TEXT.changeEmailButton}
            </button>
            <button
              type="button"
              disabled={resendLeft > 0 || requestOtp.isPending}
              onClick={() => void handleResend()}
              className="text-warm transition-colors hover:text-paper disabled:cursor-not-allowed disabled:text-paper/38"
            >
              {resendLeft > 0 ? CUSTOMER_LOGIN_TEXT.resendWait(resendLeft) : CUSTOMER_LOGIN_TEXT.resendButton}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
