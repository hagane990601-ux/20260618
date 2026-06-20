import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import menuRecipes from "../../data/menuRecipes.json";

type MenuRecipe = (typeof menuRecipes)[number];

type PageProps = {
  params: Promise<{ id: string }>;
};

function findRecipe(id: string) {
  return menuRecipes.find((recipe) => recipe.id === id);
}

function recipeDescription(recipe: MenuRecipe) {
  return `${recipe.dishes.main}、${recipe.dishes.side}、${recipe.dishes.soup}の献立。調理時間${recipe.time}、費用${recipe.cost}の夕飯候補です。`;
}

export function generateStaticParams() {
  return menuRecipes.map((recipe) => ({
    id: recipe.id,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const recipe = findRecipe(id);

  if (!recipe) {
    return {
      title: "献立が見つかりません",
    };
  }

  const description = recipeDescription(recipe);

  return {
    title: `${recipe.title}の献立 | 今日の献立配信`,
    description,
    openGraph: {
      title: recipe.title,
      description,
      images: [
        {
          url: "/og-image.svg",
          width: 1200,
          height: 630,
          alt: recipe.title,
        },
      ],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: recipe.title,
      description,
      images: ["/og-image.svg"],
    },
  };
}

export default async function MenuDetailPage({ params }: PageProps) {
  const { id } = await params;
  const recipe = findRecipe(id);

  if (!recipe) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.title,
    description: recipeDescription(recipe),
    image: "https://20260618-gules.vercel.app/og-image.svg",
    recipeCategory: "夕食",
    recipeCuisine: "和食",
    totalTime: `PT${Number.parseInt(recipe.time, 10)}M`,
    recipeYield: "2人分",
    keywords: recipe.tags.join(","),
    recipeIngredient: recipe.ingredients,
    recipeInstructions: [
      {
        "@type": "HowToStep",
        text: `${recipe.dishes.main}を作ります。`,
      },
      {
        "@type": "HowToStep",
        text: `${recipe.dishes.side}を用意します。`,
      },
      {
        "@type": "HowToStep",
        text: `${recipe.dishes.soup}を添えます。`,
      },
    ],
    nutrition: {
      "@type": "NutritionInformation",
      calories: recipe.calories,
    },
  };

  return (
    <main className="page-shell">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <section className="hero-copy menu-detail-hero">
        <p className="eyebrow">献立ページ</p>
        <h1>{recipe.title}</h1>
        <p className="lead">{recipeDescription(recipe)}</p>
        <Link className="text-link" href="/">
          トップへ戻る
        </Link>
      </section>

      <section className="today-card" aria-labelledby="menu-detail">
        <div className="card-header">
          <div>
            <p className="eyebrow">主菜・副菜・汁物</p>
            <h2 id="menu-detail">献立内容</h2>
          </div>
          <span className="time-badge">{recipe.time}</span>
        </div>

        <div className="dish-grid">
          <article>
            <span>主菜</span>
            <strong>{recipe.dishes.main}</strong>
          </article>
          <article>
            <span>副菜</span>
            <strong>{recipe.dishes.side}</strong>
          </article>
          <article>
            <span>汁物</span>
            <strong>{recipe.dishes.soup}</strong>
          </article>
        </div>

        <div className="summary-grid" aria-label="献立の目安">
          <div>
            <span>費用</span>
            <strong>{recipe.cost}</strong>
          </div>
          <div>
            <span>カロリー</span>
            <strong>{recipe.calories}</strong>
          </div>
          <div>
            <span>野菜量</span>
            <strong>{recipe.vegetable}</strong>
          </div>
        </div>
      </section>

      <section className="content-grid">
        <article className="panel" aria-labelledby="recipe-ingredients">
          <h2 id="recipe-ingredients">食材</h2>
          <ul className="tag-list">
            {recipe.ingredients.map((ingredient) => (
              <li key={ingredient}>{ingredient}</li>
            ))}
          </ul>
        </article>

        <article className="panel selected-shopping" aria-labelledby="recipe-shopping">
          <p className="eyebrow">買い物メモ</p>
          <h2 id="recipe-shopping">買い物リスト</h2>
          <ul className="check-list">
            {recipe.shoppingList.map((item) => (
              <li key={item}>
                <span aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  );
}
