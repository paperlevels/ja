export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          管理画面
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          ログラインとコメントの管理
        </p>
      </div>
      {children}
    </div>
  );
}
