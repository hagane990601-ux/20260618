"use client";

import { useState } from "react";

const todayMenu = {
  date: "今日のおすすめ",
  title: "鮭と野菜のやさしい和定食",
  time: "25分",
  cost: "約780円",
  calories: "520kcal",
  vegetable: "野菜180g",
  dishes: {
    main: "鮭のフライパン蒸し",
    side: "小松菜とにんじんのごま和え",
    soup: "豆腐とわかめのみそ汁",
  },
  ingredients: ["生鮭", "小松菜", "にんじん", "豆腐", "乾燥わかめ", "みそ", "白ごま"],
};

const weeklyMenus = [
  {
    day: "月",
    main: "鶏むね肉の照り焼き",
    side: "キャベツと卵の炒め物",
    soup: "玉ねぎのみそ汁",
    shoppingList: ["鶏むね肉", "キャベツ", "卵", "玉ねぎ", "みそ", "しょうゆ", "みりん"],
  },
  {
    day: "火",
    main: "豚こま生姜焼き",
    side: "ブロッコリーサラダ",
    soup: "じゃがいもスープ",
    shoppingList: ["豚こま肉", "しょうが", "玉ねぎ", "ブロッコリー", "じゃがいも", "レタス"],
  },
  {
    day: "水",
    main: "鮭のフライパン蒸し",
    side: "小松菜のごま和え",
    soup: "豆腐とわかめのみそ汁",
    shoppingList: ["生鮭 2切れ", "小松菜 1袋", "にんじん 1本", "豆腐 1丁", "乾燥わかめ", "みそ", "白ごま"],
  },
  {
    day: "木",
    main: "豆腐ハンバーグ",
    side: "かぼちゃサラダ",
    soup: "野菜スープ",
    shoppingList: ["木綿豆腐", "鶏ひき肉", "大根", "かぼちゃ", "キャベツ", "にんじん", "コンソメ"],
  },
  {
    day: "金",
    main: "たらのきのこあんかけ",
    side: "ほうれん草のおひたし",
    soup: "大根のすまし汁",
    shoppingList: ["たら", "しめじ", "えのき", "ほうれん草", "大根", "長ねぎ", "だし"],
  },
  {
    day: "土",
    main: "鶏そぼろ丼",
    side: "トマトときゅうり",
    soup: "なめこのみそ汁",
    shoppingList: ["鶏ひき肉", "卵", "ごはん", "トマト", "きゅうり", "なめこ", "みそ"],
  },
  {
    day: "日",
    main: "野菜たっぷりカレー",
    side: "コールスロー",
    soup: "コンソメスープ",
    shoppingList: ["カレールー", "豚肉", "じゃがいも", "にんじん", "玉ねぎ", "キャベツ", "コーン"],
  },
];

const benefits = ["時短", "節約", "健康", "野菜多め"];

export default function Home() {
  const [selectedDay, setSelectedDay] = useState("水");
  const selectedMenu = weeklyMenus.find((menu) => menu.day === selectedDay) ?? weeklyMenus[2];

  return (
    <main className="page-shell">
      <section className="hero">
        <p className="eyebrow">今日の献立配信MVP</p>
        <h1>今日のごはん、もう迷わない。</h1>
        <p className="lead">
          主菜・副菜・汁物から買い物リストまで、毎日の食卓にちょうどいい献立をまとめて提案します。
        </p>
        <div className="benefit-row" aria-label="献立の目的">
          {benefits.map((benefit) => (
            <span key={benefit}>{benefit}</span>
          ))}
        </div>
      </section>

      <section className="today-card" aria-labelledby="today-menu">
        <div className="card-header">
          <div>
            <p className="eyebrow">{todayMenu.date}</p>
            <h2 id="today-menu">{todayMenu.title}</h2>
          </div>
          <span className="time-badge">{todayMenu.time}</span>
        </div>

        <div className="dish-grid">
          <article>
            <span>主菜</span>
            <strong>{todayMenu.dishes.main}</strong>
          </article>
          <article>
            <span>副菜</span>
            <strong>{todayMenu.dishes.side}</strong>
          </article>
          <article>
            <span>汁物</span>
            <strong>{todayMenu.dishes.soup}</strong>
          </article>
        </div>

        <div className="summary-grid" aria-label="献立の目安">
          <div>
            <span>費用</span>
            <strong>{todayMenu.cost}</strong>
          </div>
          <div>
            <span>カロリー</span>
            <strong>{todayMenu.calories}</strong>
          </div>
          <div>
            <span>野菜量</span>
            <strong>{todayMenu.vegetable}</strong>
          </div>
        </div>
      </section>

      <section className="content-grid">
        <article className="panel" aria-labelledby="ingredients">
          <h2 id="ingredients">食材リスト</h2>
          <ul className="tag-list">
            {todayMenu.ingredients.map((ingredient) => (
              <li key={ingredient}>{ingredient}</li>
            ))}
          </ul>
        </article>

        <article className="panel selected-shopping" aria-labelledby="shopping">
          <p className="eyebrow">{selectedMenu.day}曜日の買い物</p>
          <h2 id="shopping">{selectedMenu.main}</h2>
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
          <p className="eyebrow">曜日を押すと買い物リストが変わります</p>
          <h2 id="weekly">1週間分の献立</h2>
        </div>
        <div className="weekly-list">
          {weeklyMenus.map((menu) => (
            <button
              key={menu.day}
              className={`weekly-card ${menu.day === selectedDay ? "is-selected" : ""}`}
              type="button"
              onClick={() => setSelectedDay(menu.day)}
              aria-pressed={menu.day === selectedDay}
            >
              <span className="day">{menu.day}</span>
              <span>
                <strong>{menu.main}</strong>
                <small>{menu.side}</small>
                <small>{menu.soup}</small>
              </span>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
