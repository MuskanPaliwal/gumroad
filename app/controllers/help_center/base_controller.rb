# frozen_string_literal: true

class HelpCenter::BaseController < ApplicationController
  layout "inertia"

  inertia_share do
    {
      help_center: {
        helper_widget: {
          host: helper_widget_host,
          session: helper_session,
          new_ticket_url: user_signed_in? ? support_index_path(new_ticket: true) : help_center_root_path(new_ticket: true),
          recaptcha_site_key: user_signed_in? ? nil : GlobalConfig.get("RECAPTCHA_LOGIN_SITE_KEY"),
          user_signed_in: user_signed_in?
        }
      }
    }
  end

  rescue_from ActiveHash::RecordNotFound, with: :redirect_to_help_center_root

  private
    def redirect_to_help_center_root
      redirect_to help_center_root_path, status: :found
    end
end
