"use client";
import { SallyTarget } from "@supportsally/react";

import React, { useState } from "react";
import { authClient } from "@/lib/auth-client";

import { Icons } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { MailIcon } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

type Step = "email" | "otp";

export function LoginComponent({
  googleLogin = false,
  passwordLogin = false,
  demoEmail = "test@nextcrm.app",
}: {
  googleLogin?: boolean;
  passwordLogin?: boolean;
  demoEmail?: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState(passwordLogin ? demoEmail : "");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const showGoogle = googleLogin && !passwordLogin;

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });
    } catch (error) {
      toast.error("Something went wrong with Google sign-in.");
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithPassword = async () => {
    if (!email || !password) {
      toast.error("Enter email and password.");
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await authClient.signIn.email({
        email,
        password,
        callbackURL: "/",
      });
      if (error) {
        toast.error(error.message || "Invalid email or password.");
        return;
      }
      toast.success("Login successful.");
      window.location.href = "/";
    } catch (error) {
      toast.error("Sign-in failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const sendOtp = async () => {
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }
    setIsLoading(true);
    setDevOtp(null);
    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "sign-in",
      });
      if (error) {
        toast.error(error.message || "Failed to send verification code.");
        return;
      }
      setStep("otp");
      if (process.env.NODE_ENV !== "production") {
        try {
          const otpRes = await fetch(
            `/api/auth/test-otp?email=${encodeURIComponent(email)}`,
          );
          if (otpRes.ok) {
            const data = (await otpRes.json()) as { otp?: string };
            if (data.otp) setDevOtp(data.otp);
          }
        } catch {
          // test-otp is best-effort in local dev
        }
        toast.success("Verification code captured for local sign-in.");
      } else {
        toast.success("Verification code sent to your email.");
      }
    } catch (error) {
      toast.error("Failed to send verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter the 6-digit code.");
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await authClient.signIn.emailOtp({
        email,
        otp,
      });
      if (error) {
        toast.error(error.message || "Invalid or expired code.");
        return;
      }
      toast.success("Login successful.");
      window.location.href = "/";
    } catch (error) {
      toast.error("Verification failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const description = passwordLogin
    ? "Enter the CRM password you were provided."
    : showGoogle
      ? "Continue with Google, or we'll email you a code."
      : "We'll email you a 6-digit code.";

  return (
    <Card className="shadow-lg my-5">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {showGoogle && (
          <>
            <SallyTarget id="continue-with-google" label="Continue with Google">
              <Button
                variant="outline"
                onClick={loginWithGoogle}
                disabled={isLoading}
                className="w-full"
              >
                <Icons.google className="mr-2 h-4 w-4" />
                Continue with Google
              </Button>
            </SallyTarget>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>
          </>
        )}

        {passwordLogin && (
          <form
            className="grid gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              loginWithPassword();
            }}
          >
            <div className="grid gap-1.5">
              <Label htmlFor="email">Username</Label>
              <SallyTarget id="email3" label="Email" completeWhen="email3Filled">
                <Input
                  id="email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  readOnly
                  disabled={isLoading}
                />
              </SallyTarget>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                autoFocus
                placeholder="CRM password you were provided"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <SallyTarget id="sign-in" label="Sign in">
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !email || !password}
              >
                Sign in
              </Button>
            </SallyTarget>
          </form>
        )}

        {!passwordLogin && step === "email" && (
          <form
            className="grid gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              sendOtp();
            }}
          >
            <div className="grid gap-1.5">
              <Label htmlFor="email">Email</Label>
              <SallyTarget id="email3" label="Email" completeWhen="email3Filled">
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </SallyTarget>
            </div>
            <SallyTarget id="send-verification-code" label="Send verification code">
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !email}
              >
                <MailIcon className="mr-2 h-4 w-4" />
                Send verification code
              </Button>
            </SallyTarget>
          </form>
        )}

        {!passwordLogin && step === "otp" && (
          <form
            className="grid gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              verifyOtp();
            }}
          >
            <p className="text-sm text-muted-foreground">
              Enter the 6-digit code sent to <strong>{email}</strong>
            </p>
            {devOtp && (
              <p className="rounded-md border bg-muted/50 p-3 text-center text-sm">
                Local code: <strong className="tracking-widest">{devOtp}</strong>
              </p>
            )}
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={setOtp}
                disabled={isLoading}
                autoComplete="one-time-code"
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <SallyTarget id="verify-and-sign-in" label="Verify and sign in">
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || otp.length !== 6}
              >
                Verify and sign in
              </Button>
            </SallyTarget>
            <SallyTarget id="use-a-different-email" label="Use a different email">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => {
                  setStep("email");
                  setOtp("");
                  setDevOtp(null);
                }}
                disabled={isLoading}
              >
                Use a different email
              </Button>
            </SallyTarget>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
