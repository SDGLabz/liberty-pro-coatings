"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Contractor sign-in / sign-up. Supports email+password AND passwordless
// magic links. New accounts start as 'pending' (handled by a DB trigger) and
// must be approved before they can check out.
export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const redirectTo =
    typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined;

  async function handlePassword(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setErr("");
    setMsg("");
    const supabase = createClient();
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/account");
        router.refresh();
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectTo },
        });
        if (error) throw error;
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          router.push("/account");
          router.refresh();
        } else {
          setMsg("Account created — check your email to confirm, then sign in.");
        }
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleMagicLink() {
    if (!email) {
      setErr("Enter your email first, then request a link.");
      return;
    }
    setBusy(true);
    setErr("");
    setMsg("");
    const supabase = createClient();
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo, shouldCreateUser: true },
      });
      if (error) throw error;
      setMsg("Check your email for a one-click sign-in link.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Couldn't send the link. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <section className="pagehead">
        <div className="wrap">
          <span className="eyebrow">Contractor portal</span>
          <h1>{mode === "signin" ? "Sign in." : "Create your account."}</h1>
          <p className="lede">
            Liberty Pro sells to vetted, approved contractor installers. Sign in to manage your
            account and check out with freight-inclusive pricing.
          </p>
        </div>
      </section>

      <section>
        <div className="wrap" style={{ maxWidth: 460 }}>
          {err && (
            <p role="alert" style={{ color: "var(--red)", fontWeight: 600, fontSize: 14, marginBottom: 14 }}>
              {err}
            </p>
          )}
          {msg && (
            <p role="status" style={{ color: "var(--green)", fontWeight: 600, fontSize: 14, marginBottom: 14 }}>
              {msg}
            </p>
          )}

          <form className="form" onSubmit={handlePassword}>
            <div className="frow">
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
              />
            </div>
            <div className="frow">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                minLength={6}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
              {busy ? "Working…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <p style={{ fontSize: 14, marginTop: 14, color: "var(--txt-2)" }}>
            {mode === "signin" ? "New contractor? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setErr("");
                setMsg("");
              }}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                color: "var(--navy-bright)",
                fontWeight: 600,
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              margin: "22px 0",
              color: "var(--txt-3)",
              fontSize: 12,
              textTransform: "uppercase",
              letterSpacing: ".08em",
            }}
          >
            <span style={{ flex: 1, height: 1, background: "var(--line)" }} />
            or
            <span style={{ flex: 1, height: 1, background: "var(--line)" }} />
          </div>

          <button type="button" className="btn btn-out btn-block" onClick={handleMagicLink} disabled={busy}>
            Email me a magic link
          </button>
        </div>
      </section>
    </>
  );
}
