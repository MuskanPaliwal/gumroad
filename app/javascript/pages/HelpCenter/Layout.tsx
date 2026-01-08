import { HelperClientProvider } from "@helperai/react";
import { Head, usePage } from "@inertiajs/react";
import * as React from "react";
import { cast } from "ts-safe-cast";

import { SupportHeader } from "$app/components/server-components/support/Header";

interface HelpCenterSharedProps {
  helper_widget_host: string;
  helper_session: {
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
  is_logged_in: boolean;
}

interface LayoutProps {
  children: React.ReactNode;
  metaTitle?: string;
  metaDescription?: string;
}

export function Layout({ children, metaTitle, metaDescription }: LayoutProps) {
  const { helper_widget_host, helper_session, new_ticket_url, recaptcha_site_key, is_logged_in } =
    cast<HelpCenterSharedProps>(usePage().props);

  const [isNewTicketOpen, setIsNewTicketOpen] = React.useState(false);

  const handleOpenNewTicket = () => {
    setIsNewTicketOpen(true);
    window.location.href = new_ticket_url;
  };

  const headerContent = (
    <SupportHeader
      onOpenNewTicket={handleOpenNewTicket}
      hasHelperSession={is_logged_in}
      recaptchaSiteKey={recaptcha_site_key}
    />
  );

  return (
    <>
      <Head>
        {metaTitle && <title>{metaTitle}</title>}
        {metaDescription && <meta name="description" content={metaDescription} />}
        <link rel="canonical" href={window.location.href} />
      </Head>
      {is_logged_in && helper_widget_host && helper_session ? (
        <HelperClientProvider host={helper_widget_host} session={helper_session}>
          {headerContent}
        </HelperClientProvider>
      ) : (
        headerContent
      )}
      <section className="p-4 md:p-8">{children}</section>
    </>
  );
}
