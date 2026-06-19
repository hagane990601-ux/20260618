"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import menuRecipes from "./data/menuRecipes.json";

type MenuRecipe = (typeof menuRecipes)[number];
type MenuWithMatch = MenuRecipe & { matchCount: number };
type StoredMenu = MenuRecipe & { savedAt: string };
type StreakState = { count: number; lastVisitDate: string };
type WeeklyStatus = Record<string, boolean>;

const STORAGE_KEYS = {
  fridge: "menu-mvp.fridgeIngredients",
  favorites: "menu-mvp.favoriteMenus",
  history: "menu-mvp.cookedHistory",
  reminder: "menu-mvp.reminder",
  streak: "menu-mvp.streak",
  weeklyStatus: "menu-mvp.weeklyStatus",
};

const presetIngredients = ["生鮭", "鶏むね肉", "豚こま肉", "卵", "豆腐", "キャベツ", "にんじん", "玉ねぎ", "小松菜", "じゃがいも"];
const benefits = ["時短", "節約", "健康", "野菜多め"];
const trustPoints = ["冷蔵庫の食材から提案", "ホーム画面からすぐ開ける", "リマインダーと達成チェック"];
const defaultReminder = { enabled: false, time: "17:30", lastNotifiedDate: "" };

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

function todayKey(date = new Date()) {
  return date.toLocaleDateString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" });
}

function yesterdayKey() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return todayKey(date);
}

function matchedIngredients(recipe: MenuRecipe, fridgeIngredients: string[]) {
  const fridgeSet = new Set(fridgeIngredients.map(normalize));
  return recipe.ingredients.filter((ingredient) => fridgeSet.has(normalize(ingredient)));
}

function missingIngredients(recipe: MenuRecipe, fridgeIngredients: string[]) {
  const fridgeSet = new Set(fridgeIngredients.map(normalize));
  return recipe.ingredients.filter((ingredient) => !fridgeSet.has(normalize(ingredient)));
}

function scheduleReminder(reminderTime: string, selectedMenuTitle: string, onComplete: () => void) {
  const [hour, minute] = reminderTime.split(":").map(Number);
  const now = new Date();
  const nextReminder = new Date();
  nextReminder.setHours(hour, minute, 0, 0);
  if (nextReminder <= now) {
    nextReminder.setDate(nextReminder.getDate() + 1);
  }

  const delay = nextReminder.getTime() - now.getTime();
  return window.setTimeout(async () => {
    const registration = await navigator.serviceWorker?.ready;
    const title = "今日の献立を見る";
    const body = `${selectedMenuTitle}をチェックする時間です。`;

    if (registration && "showNotification" in registration && Notification.permission === "granted") {
      registration.showNotification(title, {
        body,
        icon: "/icon-192.svg",
        badge: "/icon-192.svg",
        data: { url: "/" },
      });
    }

    onComplete();
  }, delay);
}

export default function Home() {
  const [fridgeIngredients, setFridgeIngredients] = useState<string[]>([]);
  const [ingredientInput, setIngredientInput] = useState("");
  const [selectedMenuId, setSelectedMenuId] = useState(menuRecipes[0].id);
  const [favorites, setFavorites] = useState<StoredMenu[]>([]);
  const [saveMessage, setSaveMessage] = useState("");
  const [streak, setStreak] = useState<StreakState>({ count: 1, lastVisitDate: "" });
  const [weeklyStatus, setWeeklyStatus] = useState<WeeklyStatus>({});
  const [reminder, setReminder] = useState(defaultReminder);
  const [notificationStatus, setNotificationStatus] = useState("未設定");

  useEffect(() => {
    setFridgeIngredients(readStorage<string[]>(STORAGE_KEYS.fridge, ["生鮭", "小松菜", "豆腐"]));
    setFavorites(readStorage<StoredMenu[]>(STORAGE_KEYS.favorites, []));
    setWeeklyStatus(readStorage<WeeklyStatus>(STORAGE_KEYS.weeklyStatus, {}));
    setReminder(readStorage(STORAGE_KEYS.reminder, defaultReminder));
    setNotificationStatus("Notification" in window ? Notification.permission : "非対応");

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }

    const currentStreak = readStorage<StreakState>(STORAGE_KEYS.streak, { count: 0, lastVisitDate: "" });
    const today = todayKey();
    const nextStreak =
      currentStreak.lastVisitDate === today
        ? currentStreak
        : {
            count: currentStreak.lastVisitDate === yesterdayKey() ? currentStreak.count + 1 : 1,
            lastVisitDate: today,
          };
    setStreak(nextStreak);
    window.localStorage.setItem(STORAGE_KEYS.streak, JSON.stringify(nextStreak));
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.fridge, JSON.stringify(fridgeIngredients));
  }, [fridgeIngredients]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.weeklyStatus, JSON.stringify(weeklyStatus));
  }, [weeklyStatus]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.reminder, JSON.stringify(reminder));
  }, [reminder]);

  const suggestedMenus = useMemo<MenuWithMatch[]>(() => {
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
  const completedCount = suggestedMenus.filter((menu) => weeklyStatus[menu.id]).length;
  const weeklyProgress = Math.round((completedCount / suggestedMenus.length) * 100);

  useEffect(() => {
    if (!reminder.enabled || typeof window === "undefined" || !("Notification" in window)) return;

    const reminderId = scheduleReminder(reminder.time, selectedMenu.title, () => {
      setReminder((current) => ({ ...current, lastNotifiedDate: todayKey() }));
    });

    return () => window.clearTimeout(reminderId);
  }, [reminder.enabled, reminder.time, selectedMenu.title]);

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
    setWeeklyStatus((current) => ({ ...current, [recipe.id]: true }));
    setSaveMessage("献立履歴に追加しました");
  };

  const requestReminder = async () => {
    if (!("Notification" in window)) {
      setNotificationStatus("このブラウザは通知に対応していません");
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationStatus(permission);
    if (permission === "granted") {
      setReminder((current) => ({ ...current, enabled: true }));
      setSaveMessage("リマインダーをONにしました");
    } else {
      setSaveMessage("通知が許可されていないため、画面内のお知らせだけ表示します");
    }
  };

  const updateReminderTime = (event: ChangeEvent<HTMLInputElement>) => {
    setReminder((current) => ({ ...current, time: event.target.value }));
  };

  const toggleWeeklyStatus = (menuId: string) => {
    setWeeklyStatus((current) => ({ ...current, [menuId]: !current[menuId] }));
  };

  return (
    <main className="page-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">今日の献立配信MVP</p>
          <h1>冷蔵庫の中身から、夕飯を決める。</h1>
          <p className="lead">
            食材を保存すると、手元にあるものに合う献立候補を自動で並べ替えます。ホーム画面追加、リマインダー、連続利用日数で続けやすくしました。
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

      <section className="habit-grid" aria-label="継続利用の状況">
        <article className="habit-card">
          <p className="eyebrow">連続利用</p>
          <strong>{streak.count}日</strong>
          <span>今日も献立チェック済み</span>
        </article>
        <article className="habit-card">
          <p className="eyebrow">週間達成</p>
          <strong>{completedCount}/{suggestedMenus.length}</strong>
          <div className="progress-track" aria-label={`週間献立の達成率 ${weeklyProgress}%`}>
            <span style={{ width: `${weeklyProgress}%` }} />
          </div>
        </article>
        <article className="habit-card reminder-card">
          <p className="eyebrow">リマインダー</p>
          <div className="reminder-controls">
            <input aria-label="リマインダー時刻" type="time" value={reminder.time} onChange={updateReminderTime} />
            <button className="secondary-button" type="button" onClick={requestReminder}>
              {reminder.enabled ? "通知ON" : "通知を許可"}
            </button>
          </div>
          <span>状態: {notificationStatus}</span>
        </article>
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

      <section className="weekly-section" aria-labelledby="weekly">
        <div className="section-title">
          <p className="eyebrow">実行済みをチェック</p>
          <h2 id="weekly">週間献立</h2>
        </div>
        <div className="weekly-list">
          {suggestedMenus.map((menu, index) => {
            const isDone = Boolean(weeklyStatus[menu.id]);

            return (
              <article key={menu.id} className={`weekly-card ${menu.id === selectedMenu.id ? "is-selected" : ""}`}>
                <label className="weekly-check">
                  <input type="checkbox" checked={isDone} onChange={() => toggleWeeklyStatus(menu.id)} />
                  <span>{isDone ? "実行済み" : "未実行"}</span>
                </label>
                <button type="button" onClick={() => setSelectedMenuId(menu.id)} aria-pressed={menu.id === selectedMenu.id}>
                  <span className="day">{index + 1}</span>
                  <span>
                    <strong>{menu.title}</strong>
                    <small>{menu.dishes.main}</small>
                    <small>一致: {matchedIngredients(menu, fridgeIngredients).join("、") || "なし"}</small>
                  </span>
                </button>
              </article>
            );
          })}
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
