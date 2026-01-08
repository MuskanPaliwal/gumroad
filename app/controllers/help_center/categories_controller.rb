# frozen_string_literal: true

class HelpCenter::CategoriesController < HelpCenter::BaseController
  def show
    @category = HelpCenter::Category.find_by!(slug: params[:slug])

    @title = "#{@category.title} - Gumroad Help Center"
    @canonical_url = help_center_category_url(@category)

    render inertia: "HelpCenter/CategoryShow", props: {
      category: {
        id: @category.id,
        title: @category.title,
        slug: @category.slug
      },
      articles: @category.articles.map do |article|
        {
          id: article.id,
          title: article.title,
          slug: article.slug,
          url: help_center_article_path(article)
        }
      end,
      sidebar_categories: @category.categories_for_same_audience.map do |cat|
        {
          id: cat.id,
          title: cat.title,
          slug: cat.slug,
          url: help_center_category_path(cat),
          is_active: cat.id == @category.id
        }
      end
    }
  end
end
