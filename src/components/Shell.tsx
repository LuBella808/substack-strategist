"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Shell({ children, showNav = true }: { children: React.ReactNode; showNav?: boolean }) {
  const path = usePathname();
  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };
  const item = (href: string, label: string) => (
    <Link href={href} aria-current={path === href ? "page" : undefined}>
      {label}
    </Link>
  );
  return (
    <>
      <header className="top">
        <div className="wrap">
          <Link href="/" className="brand">
            <span className="star">★</span> The Substack Strategist <small>with Lucinda Rae</small>
          </Link>
          {showNav && (
            <nav className="nav" aria-label="Main">
              {item("/studio", "Studio")}
              {item("/blueprint", "Blueprint")}
              {item("/session", "Session")}
              <button onClick={logout}>Log out</button>
            </nav>
          )}
        </div>
      </header>
      {children}
    </>
  );
}
