"use client";

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

const passwordLogin = process.env.NEXT_PUBLIC_PASSWORD_LOGIN === "true";
const localEmail = process.env.NEXT_PUBLIC_TEST_USER_EMAIL || "test@nextcrm.app";
const localPassword = process.env.NEXT_PUBLIC_TEST_USER_PASSWORD || "sally-local";

export function LoginComponent() {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState(passwordLogin ? localEmail : "");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);

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

  return (
    <Card className="shadow-lg my-5">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          {passwordLogin
            ? "Use the local test account, or continue with email OTP."
            : "Choose your sign-in method"}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {passwordLogin && (
          <p className="rounded-md border bg-muted/50 p-3 text-sm text-muted-foreground">
            Local test account: <strong>{localEmail}</strong> /{" "}
            <strong>{localPassword}</strong>
          </p>
        )}

        <Button
          variant="outline"
          onClick={loginWithGoogle}
          disabled={isLoading}
          className="w-full"
        >
          <Icons.google className="mr-2 h-4 w-4" />
          Continue with Google
        </Button>

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

        {step === "email" && (
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  (passwordLogin ? loginWithPassword() : sendOtp())
                }
              />
            </div>
            {passwordLogin && (
              <div className="grid gap-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  onKeyDown={(e) => e.key === "Enter" && loginWithPassword()}
                />
              </div>
            )}
            {passwordLogin && (
              <Button
                onClick={loginWithPassword}
                disabled={isLoading || !email || !password}
              >
                Sign in
              </Button>
            )}
            <Button
              variant={passwordLogin ? "outline" : "default"}
              onClick={sendOtp}
              disabled={isLoading || !email}
            >
              <MailIcon className="mr-2 h-4 w-4" />
              Send verification code
            </Button>
          </div>
        )}

        {step === "otp" && (
          <div className="grid gap-3">
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
            <Button onClick={verifyOtp} disabled={isLoading || otp.length !== 6}>
              Verify and sign in
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStep("email");
                setOtp("");
                setDevOtp(null);
              }}
              disabled={isLoading}
            >
              Use a different email
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
