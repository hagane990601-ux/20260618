import menuRecipes from "./menuRecipes.json";

export type DailyMenu = {
  dayIndex: number;
  dayLabel: string;
  recipeId: (typeof menuRecipes)[number]["id"];
};

export type WeeklyMenu = {
  id: string;
  title: string;
  dailyMenus: DailyMenu[];
};

const dayLabels = ["月", "火", "水", "木", "金", "土", "日"];

function createDailyMenus(recipeIds: DailyMenu["recipeId"][]): DailyMenu[] {
  return recipeIds.map((recipeId, dayIndex) => ({
    dayIndex,
    dayLabel: dayLabels[dayIndex],
    recipeId,
  }));
}

export const weeklyMenus: WeeklyMenu[] = [
  {
    id: "week-1",
    title: "からだ想いの和ごはん週",
    dailyMenus: createDailyMenus([
      "salmon-vegetable-set",
      "chicken-cabbage-set",
      "pork-potato-set",
      "tofu-egg-set",
      "mackerel-daikon-set",
      "egg-rice-set",
      "chicken-tofu-set",
    ]),
  },
  {
    id: "week-2",
    title: "時短と野菜を楽しむ週",
    dailyMenus: createDailyMenus([
      "chicken-cabbage-set",
      "tofu-egg-set",
      "salmon-vegetable-set",
      "egg-rice-set",
      "chicken-tofu-set",
      "pork-potato-set",
      "mackerel-daikon-set",
    ]),
  },
  {
    id: "week-3",
    title: "節約バランスごはん週",
    dailyMenus: createDailyMenus([
      "egg-rice-set",
      "pork-potato-set",
      "chicken-tofu-set",
      "chicken-cabbage-set",
      "salmon-vegetable-set",
      "tofu-egg-set",
      "mackerel-daikon-set",
    ]),
  },
  {
    id: "week-4",
    title: "ゆったり健康ごはん週",
    dailyMenus: createDailyMenus([
      "mackerel-daikon-set",
      "salmon-vegetable-set",
      "tofu-egg-set",
      "chicken-tofu-set",
      "egg-rice-set",
      "chicken-cabbage-set",
      "pork-potato-set",
    ]),
  },
];

const rotationStartMonday = new Date(2026, 0, 5);

export function getMonday(date = new Date()) {
  const monday = new Date(date);
  const dayOffset = (monday.getDay() + 6) % 7;
  monday.setDate(monday.getDate() - dayOffset);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export function getWeekNumber(date = new Date()) {
  const currentMonday = getMonday(date);
  return Math.floor((currentMonday.getTime() - rotationStartMonday.getTime()) / 604800000);
}

export function getCurrentWeeklyMenu(date = new Date()) {
  const weekNumber = getWeekNumber(date);
  const menuIndex = ((weekNumber % weeklyMenus.length) + weeklyMenus.length) % weeklyMenus.length;
  return weeklyMenus[menuIndex];
}

export function getTodayDailyMenu(weeklyMenu: WeeklyMenu, date = new Date()) {
  const dayIndex = (date.getDay() + 6) % 7;
  return weeklyMenu.dailyMenus[dayIndex];
}
