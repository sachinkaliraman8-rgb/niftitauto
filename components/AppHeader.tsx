import Link from "next/link";
import Logo from "./Logo";

export default function AppHeader({
  email,
  isAdmin,
}: {
  email: string;
  isAdmin?: boolean;
}) {
  return (
    <header className="app-header">
      <nav>
        <Link href="/" className="mark">
          <Logo />
          Niftit
        </Link>
        <div className="navlinks">
          <span className="navlink">{email}</span>
          {isAdmin && (
            <Link href="/admin/plans" className="navlink">
              Admin
            </Link>
          )}
          {!isAdmin && (
            <>
              <Link href="/app" className="navlink">
                Signals
              </Link>
              <Link href="/app/billing" className="navlink">
                Billing
              </Link>
            </>
          )}
          <form action="/auth/signout" method="post">
            <button type="submit" className="btn btn-line btn-sm">
              Log out
            </button>
          </form>
        </div>
      </nav>
    </header>
  );
}
