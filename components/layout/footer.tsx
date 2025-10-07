"use client";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-6 py-4">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
              <span className="text-xs font-bold text-primary-foreground">
                W
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Wealth Tracker. All rights reserved.
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>
              built with curiosity by{" "}
              <a
                href="https://x.com/nirudhuuu"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                anirudh
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
