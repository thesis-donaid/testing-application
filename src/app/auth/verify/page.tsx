"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState, FormEvent, useEffect, useRef } from "react";

// Helper to get initial cooldown from localStorage
function getInitialCooldown(): number {
  if (typeof window === "undefined") return 0;
  const stored = localStorage.getItem("otpCooldown");
  if (stored) {
    const remaining = Math.floor((Number(stored) - Date.now()) / 1000);
    return remaining > 0 ? remaining : 0;
  }
  return 0;
}

export default function VerifyOtp() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(getInitialCooldown);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [isResending, setIsResending] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Verification failed");
        setLoading(false);
        return;
      }

      // Full page redirect to force session reload
      window.location.href = "/profile";
    } catch (err) {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  // Handle the countdown timer
  useEffect(() => {
    if (cooldown <= 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // Start the countdown timer
    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          // Clear the timer and localStorage when countdown reaches 0
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          localStorage.removeItem("otpCooldown");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup the timer on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [cooldown]);


  const handleResend = async () => {
    if (cooldown > 0) return;

    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    await signIn("google");

    const expiry = Date.now() + 120 * 1000;
    localStorage.setItem("otpCooldown", expiry.toString());
    setCooldown(120);
  };



  

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 border rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Enter Verification Code
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          We sent a 6-digit code to <strong>{email}</strong>
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter 6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={6}
            className="w-full px-4 py-3 border rounded-lg text-center text-2xl tracking-widest mb-4"
            required
          />

          {error && (
            <p className="text-red-500 text-sm text-center mb-4">{error}</p>
          )}

          <Button
            type="submit"
            loading={loading}
            loadingText="Verifying..."
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
          >
            Verify
          </Button>

          {/* <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify"}
          </button> */}
        </form>

        <Button
          onClick={handleResend}
          disabled={cooldown > 0 || isResending}
          className="w-full mt-4 text-blue-600 hover:underline disabled:opacity-50"
        >
          {cooldown > 0 ? (
            <p className="text-center text-blue-600 mb-2">
              Please wait {cooldown}s before requesting a new code
            </p>
          ) : (
            <p className="text-center text-blue-600 mb-2">Resend</p>
          )}
      
        </Button>
      </div>
    </div>
  );
}