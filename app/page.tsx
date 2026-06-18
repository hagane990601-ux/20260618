const features = [
  "Next.js App Router",
  "React 19",
  "TypeScript",
  "スマホでも見やすいレスポンシブUI",
];

export default function Home() {
  return (
    <main className="page-shell">
      <section className="hero">
        <p className="eyebrow">2026.06.18</p>
        <h1>Next.jsアプリを作成しました</h1>
        <p className="lead">
          GitHubリポジトリ `20260618` に公開するための、シンプルなNext.js / React / TypeScriptアプリです。
        </p>
      </section>

      <section className="card" aria-labelledby="features">
        <h2 id="features">含まれているもの</h2>
        <ul>
          {features.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
