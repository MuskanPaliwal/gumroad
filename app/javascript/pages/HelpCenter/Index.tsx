import { HelperClientProvider } from "@helperai/react";
import { Head, usePage } from "@inertiajs/react";
import * as React from "react";
import { cast } from "ts-safe-cast";

import { NavigationButton } from "$app/components/Button";
import { SupportHeader } from "$app/components/server-components/support/Header";

interface Article {
  id: number;
  title: string;
  slug: string;
  url: string;
}

interface Category {
  title: string;
  slug: string;
  url: string;
  audience: string;
  articles: Article[];
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
  categories: Category[];
};

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");

const renderHighlightedText = (text: string, searchTerm: string): React.ReactNode => {
  if (!searchTerm) return text;

  const escaped = escapeRegExp(searchTerm);
  const regex = new RegExp(`(${escaped})`, "giu");

  return (
    <span
      dangerouslySetInnerHTML={{
        __html: text.replace(regex, (match) => `<mark class="highlight rounded-xs bg-pink">${match}</mark>`),
      }}
    />
  );
};

const CategoryArticles = ({ category, searchTerm }: { category: Category; searchTerm: string }) => {
  if (category.articles.length === 0) return null;

  return (
    <div className="w-full">
      <h2 className="mb-4 font-semibold">{category.title}</h2>
      <div
        className="w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        style={{ display: "grid", gridAutoRows: "160px" }}
      >
        {category.articles.map((article) => (
          <NavigationButton
            key={article.url}
            href={article.url}
            color="filled"
            className="box-border! flex! h-full! w-full! items-center! justify-center! p-12! text-center text-xl!"
          >
            {renderHighlightedText(article.title, searchTerm)}
          </NavigationButton>
        ))}
      </div>
    </div>
  );
};

export default function HelpCenterIndex() {
  const { categories, ...sharedProps } = cast<Props & HelpCenterSharedProps>(usePage().props);
  const { help_center } = sharedProps;
  const { helper_widget } = help_center;

  const [searchTerm, setSearchTerm] = React.useState("");
  const [isNewTicketOpen, setIsNewTicketOpen] = React.useState(false);

  const filteredCategories = searchTerm
    ? categories.map((category) => ({
        ...category,
        articles: category.articles.filter((article) => article.title.toLowerCase().includes(searchTerm.toLowerCase())),
      }))
    : categories;

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
        <meta name="description" content="Common questions and support documentation" />
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
        <input
          type="text"
          autoFocus
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search articles..."
          className="w-full"
        />
        <div className="mt-12 space-y-12">
          {filteredCategories.map((category) => (
            <CategoryArticles key={category.url} category={category} searchTerm={searchTerm} />
          ))}
        </div>
      </section>
    </>
  );
}
