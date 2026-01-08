import { HelperClientProvider } from "@helperai/react";
import { Head, usePage } from "@inertiajs/react";
import * as React from "react";
import { cast } from "ts-safe-cast";

import { NavigationButton } from "$app/components/Button";
import { Icon } from "$app/components/Icons";
import { SupportHeader } from "$app/components/server-components/support/Header";

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

interface HelpCenterSharedProps {
  help_center: {
    helper_widget: {
      host: string;
      session: {
        email?: string | null;
        emailHash?: string | null;
        timestamp?: number | null;
        customerMetadata?: {
          name?: string | null;
          value?: number | null;
          links?: Record<string, string> | null;
        } | null;
        currentToken?: string | null;
      };
      new_ticket_url: string;
      recaptcha_site_key?: string | null;
      user_signed_in: boolean;
    };
  };
}

type Props = {
  category: Category;
  articles: Article[];
  sidebar_categories: SidebarCategory[];
};

export default function HelpCenterCategoryShow() {
  const { category, articles, sidebar_categories, ...sharedProps } = cast<Props & HelpCenterSharedProps>(
    usePage().props,
  );
  const { help_center } = sharedProps;
  const { helper_widget } = help_center;

  const [isNewTicketOpen, setIsNewTicketOpen] = React.useState(false);

  const handleOpenNewTicket = () => {
    setIsNewTicketOpen(true);
    window.location.href = helper_widget.new_ticket_url;
  };

  const headerContent = (
    <SupportHeader
      onOpenNewTicket={handleOpenNewTicket}
      hasHelperSession={helper_widget.user_signed_in}
      recaptchaSiteKey={helper_widget.recaptcha_site_key}
    />
  );

  return (
    <>
      <Head>
        <link rel="canonical" href={window.location.href} />
      </Head>
      {helper_widget.user_signed_in && helper_widget.host && helper_widget.session ? (
        <HelperClientProvider host={helper_widget.host} session={helper_widget.session}>
          {headerContent}
        </HelperClientProvider>
      ) : (
        headerContent
      )}
      <section className="p-4 md:p-8">
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
      </section>
    </>
  );
}
