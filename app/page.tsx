"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import menuRecipes from "./data/menuRecipes.json";

type MenuRecipe = (typeof menuRecipes)[number];
type StoredMenu = MenuRecipe & { savedAt: string };

const STORAGE_KEYS = {
  fridge: "menu-mvp.fridgeIngredients",
  favorites: "menu-mvp.favoriteMenus",
  history: "menu-mvp.cookedHistory",
};

const presetIngredients = ["生鮭", "鶏むね肉", "豚こま肉", "卵", "豆腐", "キャベツ", "にんじん", "玉ねぎ", "小松菜", "じゃがいも"];
const benefits = ["時短", "節約", "健康", "野菜多め"];
const trustPoints = ["冷蔵庫の食材から提案", "買い物リストまで自動表示", "お気に入りと履歴を保存"];

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const rawValue = window.localStorage.getItem(key);
  if (!rawValue) return fallback;

  try {
    return JSON.parse(rawValue) as T;
  } catch {
    return fallback;
  }
}

function matchedIngredients(recipe: MenuRecipe, fridgeIngredients: string[]) {
  const fridgeSet = new Set(fridgeIngredients.map(normalize));
  return recipe.ingredients.filter((ingredient) => fridgeSet.has(normalize(ingredient)));
}

function missingIngredients(recipe: MenuRecipe, fridgeIngredients: string[]) {
  const fridgeSet = new Set(fridgeIngredients.map(normalize));
  return recipe.ingredients.filter((ingredient) => !fridgeSet.has(normalize(ingredient)));
}

export default function Home() {
  const [fridgeIngredients, setFridgeIngredients] = useState<string[]>([]);
  const [ingredientInput, setIngredientInput] = useState("");
  const [selectedMenuId, setSelectedMenuId] = useState(menuRecipes[0].id);
  const [favorites, setFavorites] = useState<StoredMenu[]>([]);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    setFridgeIngredients(readStorage<string[]>(STORAGE_KEYS.fridge, ["生鮭", "小松菜", "豆腐"]));
    setFavorites(readStorage<StoredMenu[]>(STORAGE_KEYS.favorites, []));
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.fridge, JSON.stringify(fridgeIngredients));
  }, [fridgeIngredients]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(favorites));
  }, [favorites]);

  const suggestedMenus = useMemo(() => {
    return [...menuRecipes]
      .map((recipe) => ({
        ...recipe,
        matchCount: matchedIngredients(recipe, fridgeIngredients).length,
      }))
      .sort((a, b) => b.matchCount - a.matchCount || a.ingredients.length - b.ingredients.length);
  }, [fridgeIngredients]);

  useEffect(() => {
    if (suggestedMenus.length > 0) {
      setSelectedMenuId(suggestedMenus[0].id);
    }
  }, [suggestedMenus]);

  const selectedMenu = suggestedMenus.find((menu) => menu.id === selectedMenuId) ?? suggestedMenus[0];
  const selectedMatchedIngredients = matchedIngredients(selectedMenu, fridgeIngredients);
  const selectedMissingIngredients = missingIngredients(selectedMenu, fridgeIngredients);
  const favoriteIds = new Set(favorites.map((menu) => menu.id));

  const addIngredient = (ingredient: string) => {
    const nextIngredient = ingredient.trim();
    if (!nextIngredient) return;
    setFridgeIngredients((current) =>
      current.some((item) => normalize(item) === normalize(nextIngredient)) ? current : [...current, nextIngredient],
    );
    setIngredientInput("");
  };

  const submitIngredient = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    addIngredient(ingredientInput);
  };

  const removeIngredient = (ingredient: string) => {
    setFridgeIngredients((current) => current.filter((item) => item !== ingredient));
  };

  const saveFavorite = (recipe: MenuRecipe) => {
    if (favoriteIds.has(recipe.id)) {
      setSaveMessage("すでにお気に入りに入っています");
      return;
    }
    setFavorites((current) => [{ ...recipe, savedAt: new Date().toISOString() }, ...current]);
    setSaveMessage("お気に入りに保存しました");
  };

  const removeFavorite = (recipeId: string) => {
    setFavorites((current) => current.filter((recipe) => recipe.id !== recipeId));
  };

  const addToHistory = (recipe: MenuRecipe) => {
    const history = readStorage<StoredMenu[]>(STORAGE_KEYS.history, []);
    const nextHistory = [{ ...recipe, savedAt: new Date().toISOString() }, ...history].slice(0, 20);
    window.localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(nextHistory));
    setSaveMessage("献立履歴に追加しました");
  };

  return (
    <main className="page-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">今日の献立配信MVP</p>
          <h1>冷蔵庫の中身から、夕飯を決める。</h1>
          <p className="lead">
            食材を保存すると、手元にあるものに合う献立候補を自動で並べ替えます。お気に入りと作った履歴も残せます。
          </p>
          <div className="benefit-row" aria-label="献立の目的">
            {benefits.map((benefit) => (
              <span key={benefit}>{benefit}</span>
            ))}
          </div>
        </div>
        <div className="hero-panel" aria-label="サービスの特徴">
          <strong>できること</strong>
          <ul>
            {trustPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          <Link className="text-link" href="/history">
            献立履歴を見る
          </Link>
        </div>
      </section>

      <section className="fridge-card" aria-labelledby="fridge">
        <div className="card-header">
          <div>
            <p className="eyebrow">localStorageに保存</p>
            <h2 id="fridge">冷蔵庫にある食材</h2>
          </div>
          <span className="time-badge">{fridgeIngredients.length}品</span>
        </div>
        <form className="ingredient-form" onSubmit={submitIngredient}>
          <input
            aria-label="食材名"
            placeholder="例: 卵、豆腐、キャベツ"
            value={ingredientInput}
            onChange={(event) => setIngredientInput(event.target.value)}
          />
          <button className="primary-button" type="submit">
            追加
          </button>
        </form>
        <div className="preset-row" aria-label="よく使う食材">
          {presetIngredients.map((ingredient) => (
            <button key={ingredient} type="button" onClick={() => addIngredient(ingredient)}>
              {ingredient}
            </button>
          ))}
        </div>
        <ul className="tag-list fridge-tags">
          {fridgeIngredients.map((ingredient) => (
            <li key={ingredient}>
              {ingredient}
              <button type="button" onClick={() => removeIngredient(ingredient)} aria-label={`${ingredient}を削除`}>
                ×
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="today-card" aria-labelledby="today-menu">
        <div className="card-header">
          <div>
            <p className="eyebrow">おすすめ献立</p>
            <h2 id="today-menu">{selectedMenu.title}</h2>
          </div>
          <span className="time-badge">{selectedMenu.time}</span>
        </div>

        <div className="dish-grid">
          <article>
            <span>主菜</span>
            <strong>{selectedMenu.dishes.main}</strong>
          </article>
          <article>
            <span>副菜</span>
            <strong>{selectedMenu.dishes.side}</strong>
          </article>
          <article>
            <span>汁物</span>
            <strong>{selectedMenu.dishes.soup}</strong>
          </article>
        </div>

        <div className="summary-grid" aria-label="献立の目安">
          <div>
            <span>一致食材</span>
            <strong>{selectedMatchedIngredients.length}品</strong>
          </div>
          <div>
            <span>費用</span>
            <strong>{selectedMenu.cost}</strong>
          </div>
          <div>
            <span>野菜量</span>
            <strong>{selectedMenu.vegetable}</strong>
          </div>
        </div>

        <div className="action-row">
          <button className="secondary-button" type="button" onClick={() => saveFavorite(selectedMenu)}>
            お気に入り保存
          </button>
          <button className="secondary-button" type="button" onClick={() => addToHistory(selectedMenu)}>
            作った献立に追加
          </button>
        </div>
        {saveMessage ? <p className="save-message">{saveMessage}</p> : null}
      </section>

      <section className="content-grid">
        <article className="panel" aria-labelledby="ingredients">
          <h2 id="ingredients">足りない食材</h2>
          <ul className="tag-list">
            {selectedMissingIngredients.map((ingredient) => (
              <li key={ingredient}>{ingredient}</li>
            ))}
          </ul>
        </article>

        <article className="panel selected-shopping" aria-labelledby="shopping">
          <p className="eyebrow">自動生成</p>
          <h2 id="shopping">買い物リスト</h2>
          <ul className="check-list">
            {selectedMenu.shoppingList.map((item) => (
              <li key={item}>
                <span aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="weekly-section" aria-labelledby="candidates">
        <div className="section-title">
          <p className="eyebrow">冷蔵庫の食材に合わせて並び替え</p>
          <h2 id="candidates">献立候補</h2>
        </div>
        <div className="weekly-list">
          {suggestedMenus.map((menu) => (
            <button
              key={menu.id}
              className={`weekly-card ${menu.id === selectedMenu.id ? "is-selected" : ""}`}
              type="button"
              onClick={() => setSelectedMenuId(menu.id)}
              aria-pressed={menu.id === selectedMenu.id}
            >
              <span className="day">{menu.matchCount}</span>
              <span>
                <strong>{menu.title}</strong>
                <small>{menu.dishes.main}</small>
                <small>一致: {matchedIngredients(menu, fridgeIngredients).join("、") || "なし"}</small>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="weekly-section" aria-labelledby="favorites">
        <div className="section-title">
          <p className="eyebrow">localStorageに保存</p>
          <h2 id="favorites">お気に入り献立</h2>
        </div>
        {favorites.length === 0 ? (
          <p className="empty-text">気に入った献立を保存すると、ここに表示されます。</p>
        ) : (
          <div className="favorite-list">
            {favorites.map((menu) => (
              <article key={menu.savedAt} className="favorite-item">
                <div>
                  <h3>{menu.title}</h3>
                  <p>{menu.dishes.main}</p>
                </div>
                <button type="button" onClick={() => removeFavorite(menu.id)}>
                  削除
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
