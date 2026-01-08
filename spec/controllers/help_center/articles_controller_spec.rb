# frozen_string_literal: true

require "spec_helper"
require "inertia_rails/rspec"

describe HelpCenter::ArticlesController, inertia: true do
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

  describe "GET index" do
    it "returns successful response with Inertia page data" do
      get :index

      expect(response).to have_http_status(:ok)
      expect(inertia.component).to eq("HelpCenter/Index")
      expect(inertia.props).to match(hash_including(
        categories: an_instance_of(Array)
      ))
    end

    it "includes all categories with articles" do
      get :index

      expect(inertia.props[:categories]).to be_present
      expect(inertia.props[:categories].first).to include(:title, :slug, :url, :audience, :articles)
      expect(inertia.props[:categories].first[:articles]).to be_an(Array)
    end

    it "sets page title" do
      get :index

      expect(assigns(:title)).to eq("Gumroad Help Center")
    end
  end

  describe "GET show" do
    let(:article) { HelpCenter::Article.find(43) }

    it "returns successful response with Inertia page data" do
      get :show, params: { slug: article.slug }

      expect(response).to have_http_status(:ok)
      expect(inertia.component).to eq("HelpCenter/Show")
    end

    it "includes article data with server-rendered content" do
      get :show, params: { slug: article.slug }

      expect(inertia.props[:article]).to match(hash_including(
        id: article.id,
        title: article.title,
        slug: article.slug,
        content_html: a_string_including("<"),
        category: hash_including(
          id: article.category.id,
          title: article.category.title,
          slug: article.category.slug
        )
      ))
    end

    it "includes sidebar categories for the same audience" do
      get :show, params: { slug: article.slug }

      expect(inertia.props[:sidebar_categories]).to be_present
      article.category.categories_for_same_audience.each do |category|
        category_data = inertia.props[:sidebar_categories].find { |c| c[:id] == category.id }
        expect(category_data).to be_present
        expect(category_data).to include(
          title: category.title,
          slug: category.slug
        )
      end
    end

    it "sets page title" do
      get :show, params: { slug: article.slug }

      expect(assigns(:title)).to eq("#{article.title} - Gumroad Help Center")
    end

    it "renders article content as HTML" do
      get :show, params: { slug: article.slug }

      content_html = inertia.props[:article][:content_html]
      expect(content_html).to be_present
      expect(content_html).to include("<")
    end

    HelpCenter::Article.all.each do |test_article|
      it "renders the article #{test_article.slug}" do
        get :show, params: { slug: test_article.slug }

        expect(response).to have_http_status(:ok)
        expect(inertia.props[:article][:title]).to eq(test_article.title)
        expect(inertia.props[:article][:content_html]).to be_present
      end
    end

    context "when article is not found" do
      it "redirects to the help center root path" do
        get :show, params: { slug: "nonexistent-slug" }

        expect(response).to redirect_to(help_center_root_path)
        expect(response).to have_http_status(:found)
      end
    end

    context "when accessing the old jobs article URL" do
      it "redirects to the about page jobs section with 301 status" do
        get :show, params: { slug: "284-jobs-at-gumroad" }

        expect(response).to redirect_to("/about#jobs")
        expect(response).to have_http_status(:moved_permanently)
      end
    end
  end
end
