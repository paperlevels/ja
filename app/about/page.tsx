export const metadata = {
  title: "About - Paperlevels",
  description: "Paperlevelsについて",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 md:py-16">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          About
        </h1>
        <p className="mt-3 text-muted-foreground">
          Paperlevelsが目指すもの
        </p>
      </div>

      <div className="space-y-8">
        <section className="rounded-xl border border-border/60 bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold tracking-tight mb-3">
            Paperlevels とは
          </h2>
          <p className="text-[15px] leading-relaxed text-muted-foreground">
            AIエージェント時代にアイデアが先行しがちな状況で、
            ログライン（サイト・プロダクトの目的を一言で表すフック文）を通じてその需要を早期に検証するPoCサイトです。
          </p>
        </section>

        <section className="rounded-xl border border-border/60 bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold tracking-tight mb-3">
            コンセプト
          </h2>
          <p className="text-[15px] leading-relaxed text-muted-foreground">
            最小限の入力（ログライン一文）で、最大限のフィードバック（シェア数＋コメント）を得られる場所を目指しています。
          </p>
        </section>

        <section className="rounded-xl border border-border/60 bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold tracking-tight mb-3">
            シェア数について
          </h2>
          <p className="text-[15px] leading-relaxed text-muted-foreground">
            表示されているシェア数は、シェアボタンのクリック数をカウントしたものです。
            正確なSNS投稿数ではないことを予めご了承ください。
          </p>
        </section>

        <section className="rounded-xl border border-border/60 bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold tracking-tight mb-3">
            コメントについて
          </h2>
          <p className="text-[15px] leading-relaxed text-muted-foreground">
            コメントは追記専用です。元のログラインに対する補足・背景・関連情報を書き込むことができます。
            ユーザー側からの編集・削除はできません。
          </p>
        </section>

        <section className="rounded-xl border border-border/60 bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold tracking-tight mb-3">
            お問い合わせ
          </h2>
          <p className="text-[15px] leading-relaxed text-muted-foreground">
            不適切な投稿の通報や、その他のお問い合わせは管理者までお願いいたします。
          </p>
        </section>
      </div>
    </div>
  );
}
