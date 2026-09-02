"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Logo from "@/components/Logo";
import GoogleButton from "@/components/GoogleButton";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/app";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <div className="auth-page">
      <div className="auth-wrap">
        <div className="center" style={{ marginBottom: 30 }}>
          <Link href="/" className="mark" style={{ justifyContent: "center" }}>
            <Logo />
            Niftit
          </Link>
        </div>
        <div className="card">
          <h2 style={{ fontSize: 24, marginBottom: 4 }}>Welcome back</h2>
          <p style={{ color: "var(--muted)", fontSize: 14.5, marginBottom: 24 }}>
            Log in to see your subscriptions and their expiry.
          </p>

          <GoogleButton next={next} />
          <div className="divider">or</div>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <p className="form-msg err">{error}</p>}

            <button type="submit" className="btn btn-fill" style={{ width: "100%" }} disabled={loading}>
              {loading ? "Logging in…" : "Log in"}
            </button>
          </form>
        </div>
        <p className="auth-switch">
          New here? <Link href="/signup">Create an account</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
