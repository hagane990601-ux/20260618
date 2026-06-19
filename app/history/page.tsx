"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import menuRecipes from "../data/menuRecipes.json";

type MenuRecipe = (typeof menuRecipes)[number];
type StoredMenu = MenuRecipe & { savedAt: string };

const HISTORY_KEY = "menu-mvp.cookedHistory";

function readHistory() {
  if (typeof window === "undefined") return [] as StoredMenu[];
  const rawValue = window.localStorage.getItem(HISTORY_KEY);
  if (!rawValue) return [] as StoredMenu[];

  try {
    return JSON.parse(rawValue) as StoredMenu[];
  } catch {
    return [] as StoredMenu[];
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function HistoryPage() {
  const [history, setHistory] = useState<StoredMenu[]>([]);

  useEffect(() => {
    setHistory(readHistory());
  }, []);

  const clearHistory = () => {
    window.localStorage.removeItem(HISTORY_KEY);
    setHistory([]);
  };

  return (
    <main className="page-shell">
      <section className="hero-copy history-hero">
        <div>
          <p className="eyebrow">献立履歴</p>
          <h1>過去に作った献立</h1>
          <p className="lead">作った献立をここに残しておくと、次の買い物やリピート献立を考えやすくなります。</p>
        </div>
        <Link className="text-link" href="/">
          トップへ戻る
        </Link>
      </section>

      <section className="weekly-section" aria-labelledby="history-list">
        <div className="section-title">
          <div>
            <p className="eyebrow">localStorageに保存</p>
            <h2 id="history-list">作った献立一覧</h2>
          </div>
          {history.length > 0 ? (
            <button className="compact-button" type="button" onClick={clearHistory}>
              履歴を消す
            </button>
          ) : null}
        </div>

        {history.length === 0 ? (
          <p className="empty-text">トップページで「作った献立に追加」を押すと、ここに履歴が表示されます。</p>
        ) : (
          <div className="history-list">
            {history.map((menu) => (
              <article key={`${menu.id}-${menu.savedAt}`} className="history-item">
                <div>
                  <p className="eyebrow">{formatDate(menu.savedAt)}</p>
                  <h3>{menu.title}</h3>
                  <p>
                    {menu.dishes.main} / {menu.dishes.side} / {menu.dishes.soup}
                  </p>
                </div>
                <span className="time-badge">{menu.time}</span>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
