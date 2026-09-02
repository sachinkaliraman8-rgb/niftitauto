"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin/plans", label: "Plans" },
  { href: "/admin/purchases", label: "Purchases" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="admin-nav">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={pathname?.startsWith(link.href) ? "active" : ""}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
