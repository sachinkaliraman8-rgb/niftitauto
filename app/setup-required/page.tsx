import Link from "next/link";
import Logo from "@/components/Logo";

export default function SetupRequiredPage() {
  return (
    <div className="auth-wrap">
      <div className="center" style={{ marginBottom: 30 }}>
        <Link href="/" className="mark" style={{ justifyContent: "center" }}>
          <Logo />
          Niftit
        </Link>
      </div>
      <div className="setup-notice">
        <p style={{ marginBottom: 10 }}>
          <strong style={{ color: "var(--text)" }}>Supabase isn&rsquo;t configured yet.</strong>
        </p>
        <p>
          Add <code>NEXT_PUBLIC_SUPABASE_URL</code>, <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>,
          and <code>SUPABASE_SERVICE_ROLE_KEY</code> to <code>.env.local</code>, then run{" "}
          <code>supabase/schema.sql</code> in your Supabase project&rsquo;s SQL editor.
        </p>
      </div>
    </div>
  );
}
