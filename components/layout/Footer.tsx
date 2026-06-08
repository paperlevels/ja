export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Paperlevels
          </p>
          <p className="text-xs text-muted-foreground/60">
            ログラインで需要を測る
          </p>
        </div>
      </div>
    </footer>
  );
}
