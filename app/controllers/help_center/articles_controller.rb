# frozen_string_literal: true

class HelpCenter::ArticlesController < HelpCenter::BaseController
  before_action :redirect_legacy_articles, only: :show

  def index
    @title = "Gumroad Help Center"
    @canonical_url = help_center_root_url
    @description = "Common questions and support documentation"

    render inertia: "HelpCenter/Index", props: {
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

  def show
    @article = HelpCenter::Article.find_by!(slug: params[:slug])

    @title = "#{@article.title} - Gumroad Help Center"
    @canonical_url = help_center_article_url(@article)

    # Render ERB article content to HTML string
    content_html = render_to_string(
      partial: @article.to_partial_path,
      layout: false
    )

    category = @article.category
    sidebar_categories = category.categories_for_same_audience.map do |cat|
      {
        id: cat.id,
        title: cat.title,
        slug: cat.slug,
        url: help_center_category_path(cat),
        is_active: cat.id == category.id
      }
    end

    render inertia: "HelpCenter/Show", props: {
      article: {
        id: @article.id,
        title: @article.title,
        slug: @article.slug,
        content_html: content_html,
        category: {
          id: category.id,
          title: category.title,
          slug: category.slug
        }
      },
      sidebar_categories: sidebar_categories
    }
  end

  private
    LEGACY_ARTICLE_REDIRECTS = {
      "284-jobs-at-gumroad" => "/about#jobs"
    }

    def redirect_legacy_articles
      return unless LEGACY_ARTICLE_REDIRECTS.key?(params[:slug])

      redirect_to LEGACY_ARTICLE_REDIRECTS[params[:slug]], status: :moved_permanently
    end
end
