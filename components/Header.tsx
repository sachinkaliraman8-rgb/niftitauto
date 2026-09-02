import Link from "next/link";
import Logo from "./Logo";
import InstallAppButton from "./InstallAppButton";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export default async function Header() {
  let isLoggedIn = false;

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    isLoggedIn = Boolean(user);
  }

  return (
    <header>
      <nav>
        <Link href="/" className="mark">
          <Logo />
          Niftit
        </Link>
        <div className="navlinks">
          <InstallAppButton />
          <Link href="/#pricing" className="navlink">
            Pricing
          </Link>
          <Link href={isLoggedIn ? "/app" : "/login"} className="navlink">
            {isLoggedIn ? "Open app" : "Login"}
          </Link>
        </div>
      </nav>
    </header>
  );
}
