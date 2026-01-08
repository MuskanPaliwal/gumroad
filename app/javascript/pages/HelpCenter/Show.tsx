import { usePage } from "@inertiajs/react";
import * as React from "react";
import { cast } from "ts-safe-cast";

import { Layout } from "./Layout";

interface Article {
  id: number;
  title: string;
  slug: string;
  content_html: string;
  category: {
    id: number;
    title: string;
    slug: string;
  };
}

interface SidebarCategory {
  id: number;
  title: string;
  slug: string;
  url: string;
  is_active: boolean;
}

type Props = {
  article: Article;
  sidebar_categories: SidebarCategory[];
};

export default function HelpCenterShow() {
  const { article, sidebar_categories } = cast<Props>(usePage().props);

  return (
    <Layout>
      <div className="mx-auto flex max-w-[1200px] flex-col gap-8 lg:flex-row">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 lg:flex-shrink-0">
          <div className="space-y-2">
            {sidebar_categories.map((category) => (
              <a
                key={category.id}
                href={category.url}
                className={`block rounded px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 ${
                  category.is_active ? "bg-gray-100 font-semibold dark:bg-gray-800" : ""
                }`}
              >
                {category.title}
              </a>
            ))}
          </div>
        </aside>

        {/* Article Content */}
        <main className="flex-1">
          <div className="mb-4">
            <h1 className="mb-4 text-3xl font-bold">{article.title}</h1>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <a href={Routes.help_center_root_path()} className="hover:underline">
                {article.category.title}
              </a>
            </div>
          </div>
          <div
            className="prose prose-lg max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: article.content_html }}
          />
        </main>
      </div>
    </Layout>
  );
}
