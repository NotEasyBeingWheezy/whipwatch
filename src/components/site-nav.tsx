import { Link } from "@tanstack/react-router";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteNav() {
  return (
    <nav className="flex flex-wrap items-center gap-3 sm:gap-6 font-mono text-xs uppercase tracking-widest">
      <Link
        to="/"
        activeProps={{ className: "border-b-2 border-primary pb-1 text-primary" }}
        inactiveProps={{ className: "pb-1 text-muted-foreground transition-colors hover:text-foreground" }}
        activeOptions={{ exact: true }}
      >
        Home
      </Link>
      <Link
        to="/insights"
        activeProps={{ className: "border-b-2 border-primary pb-1 text-primary" }}
        inactiveProps={{ className: "pb-1 text-muted-foreground transition-colors hover:text-foreground" }}
      >
        Insights
      </Link>
      <Link
        to="/about"
        activeProps={{ className: "border-b-2 border-primary pb-1 text-primary" }}
        inactiveProps={{ className: "pb-1 text-muted-foreground transition-colors hover:text-foreground" }}
      >
        About
      </Link>
      <Link
        to="/contact"
        activeProps={{ className: "border-b-2 border-primary pb-1 text-primary" }}
        inactiveProps={{ className: "pb-1 text-muted-foreground transition-colors hover:text-foreground" }}
      >
        Contact
      </Link>
      <ThemeToggle />
    </nav>
  );
}
