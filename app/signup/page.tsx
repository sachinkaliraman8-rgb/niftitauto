"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import GoogleButton from "@/components/GoogleButton";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (!data.session) {
      setMessage("Check your inbox to confirm your email, then log in.");
      return;
    }
    window.location.href = "/app";
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
          <h2 style={{ fontSize: 24, marginBottom: 4 }}>Create your account</h2>
          <p style={{ color: "var(--muted)", fontSize: 14.5, marginBottom: 24 }}>
            Start your 7-day free trial in under a minute.
          </p>

          <GoogleButton />
          <div className="divider">or</div>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="fullName">Full name</label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
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
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <p className="form-msg err">{error}</p>}
            {message && <p className="form-msg ok">{message}</p>}

            <button type="submit" className="btn btn-fill" style={{ width: "100%" }} disabled={loading}>
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
        </div>
        <p className="auth-switch">
          Already have an account? <Link href="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
