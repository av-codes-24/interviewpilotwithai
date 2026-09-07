import { Link } from "@tanstack/react-router";

export function BrandHeader({ right }: { right?: React.ReactNode }) {
  return (
    <header className="border-b border-border/70 bg-card">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <span className="text-sm font-bold text-primary-foreground">IP</span>
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-foreground">
            Interview<span className="text-accent">Pilot</span>
          </span>
        </Link>
        {right}
      </div>
    </header>
  );
}
