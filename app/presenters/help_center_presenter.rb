# frozen_string_literal: true

class HelpCenterPresenter
  include Rails.application.routes.url_helpers

  def initialize(controller)
    @controller = controller
  end

  def index_props
    {
      categories: HelpCenter::Category.all.map do |category|
        {
          title: category.title,
          slug: category.slug,
          url: help_center_category_path(category),
          audience: category.audience,
          articles: category.articles.map do |article|
            {
              id: article.id,
              title: article.title,
              slug: article.slug,
              url: help_center_article_path(article)
            }
          end
        }
      end
    }
  end

  def article_props(article)
    content_html = render_article_content(article)
    processed_html = process_article_links(content_html)

    category = article.category
    sidebar_categories = category.categories_for_same_audience.map do |cat|
      {
        id: cat.id,
        title: cat.title,
        slug: cat.slug,
        url: help_center_category_path(cat),
        is_active: cat.id == category.id
      }
    end

    {
      article: {
        id: article.id,
        title: article.title,
        slug: article.slug,
        content_html: processed_html,
        category: {
          id: category.id,
          title: category.title,
          slug: category.slug
        }
      },
      sidebar_categories: sidebar_categories
    }
  end

  def category_props(category)
    {
      category: {
        id: category.id,
        title: category.title,
        slug: category.slug
      },
      articles: category.articles.map do |article|
        {
          id: article.id,
          title: article.title,
          slug: article.slug,
          url: help_center_article_path(article)
        }
      end,
      sidebar_categories: category.categories_for_same_audience.map do |cat|
        {
          id: cat.id,
          title: cat.title,
          slug: cat.slug,
          url: help_center_category_path(cat),
          is_active: cat.id == category.id
        }
      end
    }
  end

  private
    def render_article_content(article)
      @controller.render_to_string(
        partial: article.to_partial_path,
        layout: false
      )
    end

    def process_article_links(html)
      # Convert relative article links to full paths for Inertia navigation
      # e.g., href="128-discount-codes" -> href="/help/article/128-discount-codes"
      html.gsub(/href="(\d+-[\w-]+)"/) do
        slug = Regexp.last_match(1)
        "href=\"#{help_center_article_path(slug)}\""
      end
    end

    def default_url_options
      @controller.send(:default_url_options)
    end
end
