import { usePage } from "@inertiajs/react";
import * as React from "react";
import { cast } from "ts-safe-cast";

import { NavigationButton } from "$app/components/Button";
import { Icon } from "$app/components/Icons";

import { Layout } from "./Layout";

interface Article {
  id: number;
  title: string;
  slug: string;
  url: string;
}

interface Category {
  id: number;
  title: string;
  slug: string;
}

interface SidebarCategory {
  id: number;
  title: string;
  slug: string;
  url: string;
  is_active: boolean;
}

type Props = {
  category: Category;
  articles: Article[];
  sidebar_categories: SidebarCategory[];
};

export default function HelpCenterCategoryShow() {
  const { category, articles, sidebar_categories } = cast<Props>(usePage().props);

  return (
    <Layout>
      <div className="mx-auto flex max-w-[1200px] flex-col gap-8 lg:flex-row">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 lg:flex-shrink-0">
          <div className="space-y-2">
            {sidebar_categories.map((cat) => (
              <a
                key={cat.id}
                href={cat.url}
                className={`block rounded px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 ${
                  cat.is_active ? "bg-gray-100 font-semibold dark:bg-gray-800" : ""
                }`}
              >
                {cat.title}
              </a>
            ))}
          </div>
        </aside>

        {/* Category Articles */}
        <main className="flex-1">
          <h1 className="mb-8 text-3xl font-bold">{category.title}</h1>
          <div className="space-y-4">
            {articles.map((article) => (
              <NavigationButton
                key={article.id}
                href={article.url}
                color="filled"
                className="flex w-full items-center justify-between p-4 text-left"
              >
                <span className="flex items-center gap-3">
                  <Icon name="file-text" className="text-gray-600 dark:text-gray-400" />
                  <span className="text-lg">{article.title}</span>
                </span>
                <Icon name="chevron-right" className="text-gray-400" />
              </NavigationButton>
            ))}
          </div>
        </main>
      </div>
    </Layout>
  );
}
