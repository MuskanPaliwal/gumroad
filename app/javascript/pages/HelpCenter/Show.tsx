import { HelperClientProvider } from "@helperai/react";
import { Head, usePage } from "@inertiajs/react";
import * as React from "react";
import { cast } from "ts-safe-cast";

import { Button } from "$app/components/Button";
import { Icon } from "$app/components/Icons";
import { SupportHeader } from "$app/components/server-components/support/Header";

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
  article: Article;
  sidebar_categories: SidebarCategory[];
};

export default function HelpCenterShow() {
  const { article, sidebar_categories, ...sharedProps } = cast<Props & HelpCenterSharedProps>(usePage().props);
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
      </section>
    </>
  );
}
