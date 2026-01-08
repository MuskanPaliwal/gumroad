# frozen_string_literal: true

require "spec_helper"
require "inertia_rails/rspec"

describe HelpCenter::CategoriesController, inertia: true do
  render_views

  before do
    allow(GlobalConfig).to receive(:get).with("RECAPTCHA_LOGIN_SITE_KEY")
    allow(GlobalConfig).to receive(:get).with("HELPER_WIDGET_SECRET").and_return("test_secret")
    allow(GlobalConfig).to receive(:get).with("HELPER_WIDGET_HOST").and_return("https://helper.test")

    stub_request(:post, "https://helper.test/api/widget/session")
      .to_return(
        status: 200,
        body: { token: "mock_helper_token" }.to_json,
        headers: { "Content-Type" => "application/json" }
      )
  end

  describe "GET show" do
    let(:category) { HelpCenter::Category.first }

    it "returns successful response with Inertia page data" do
      get :show, params: { slug: category.slug }

      expect(response).to have_http_status(:ok)
      expect(inertia.component).to eq("HelpCenter/CategoryShow")
    end

    it "includes category data" do
      get :show, params: { slug: category.slug }

      expect(inertia.props[:category]).to match(hash_including(
        id: category.id,
        title: category.title,
        slug: category.slug
      ))
    end

    it "lists the category's articles" do
      get :show, params: { slug: category.slug }

      expect(inertia.props[:articles]).to be_present
      expect(inertia.props[:articles].length).to eq(category.articles.length)

      category.articles.each do |article|
        article_data = inertia.props[:articles].find { |a| a[:id] == article.id }
        expect(article_data).to be_present
        expect(article_data).to include(
          title: article.title,
          slug: article.slug,
          url: help_center_article_path(article)
        )
      end
    end

    it "includes sidebar categories for the same audience" do
      get :show, params: { slug: category.slug }

      expect(inertia.props[:sidebar_categories]).to be_present
      category.categories_for_same_audience.each do |cat|
        category_data = inertia.props[:sidebar_categories].find { |c| c[:id] == cat.id }
        expect(category_data).to be_present
        expect(category_data).to include(
          title: cat.title,
          slug: cat.slug,
          is_active: (cat.id == category.id)
        )
      end
    end

    it "sets page title" do
      get :show, params: { slug: category.slug }

      expect(assigns(:title)).to eq("#{category.title} - Gumroad Help Center")
    end

    context "when category is not found" do
      it "redirects to the help center root path" do
        get :show, params: { slug: "nonexistent-slug" }

        expect(response).to redirect_to(help_center_root_path)
        expect(response).to have_http_status(:found)
      end
    end
  end
end
