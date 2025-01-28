require "faraday"
require "json"
require "rails_helper"
require "webmock/rspec"

RSpec.describe Github::GraphqlClient do
  let(:authors) { "author1,author2" }
  let(:organization) { "my-org" }
  let(:token) { "fake-token" }
  let(:client) { described_class.new(authors, organization, token) }

  describe "#initialize" do
    it "initializes with authors, organization, and token" do
      expect(client.authors).to eq(authors)
      expect(client.organization).to eq(organization)
      expect(client.token).to eq(token)
    end
  end

  describe "#open_pull_requests" do
    let(:response_body) do
      {
        data: {
          search: {
            issueCount: 1,
            edges: [
              {
                node: {
                  author: { login: "author1" },
                  number: 1,
                  title: "Test PR",
                  isDraft: false,
                  repository: { nameWithOwner: "my-org/repo" },
                  reviews: { totalCount: 2 },
                  reviewRequests: {
                    edges: [
                      {
                        node: {
                          requestedReviewer: { login: "reviewer1" }
                        }
                      }
                    ]
                  },
                  createdAt: "2023-01-01T00:00:00Z",
                  mergedAt: nil,
                  url: "https://github.com/my-org/repo/pull/1"
                }
              }
            ]
          }
        }
      }.to_json
    end

    before do
      stub_request(:post, Github::GraphqlClient::URL)
        .to_return(status: 200, body: response_body, headers: { "Content-Type" => "application/json" })
    end

    it "returns a list of open pull requests" do
      pull_requests = client.open_pull_requests
      expect(pull_requests.size).to eq(1)
      expect(pull_requests.first.author).to eq("author1")
      expect(pull_requests.first.title).to eq("Test PR")
    end

    context "when there are errors in the response" do
      let(:response_body) do
        {
          errors: [
            { message: "Something went wrong" }
          ]
        }.to_json
      end

      it "prints the errors" do
        expect { client.open_pull_requests }.to output(/Error: Something went wrong/).to_stdout
      end
    end
  end

  describe "#authors_query" do
    it "returns a formatted authors query string" do
      expect(client.send(:authors_query)).to eq("author:author1 author:author2")
    end
  end

  describe "#organization_query" do
    context "when organization is present" do
      it "returns a formatted organization query string" do
        expect(client.send(:organization_query)).to eq("org:my-org")
      end
    end

    context "when organization is empty" do
      let(:organization) { "" }

      it "returns an empty string" do
        expect(client.send(:organization_query)).to eq("")
      end
    end
  end

  describe "#connection" do
    it "returns a Faraday connection" do
      connection = client.send(:connection)
      expect(connection).to be_a(Faraday::Connection)
      expect(connection.headers["Content-Type"]).to eq("application/json")
    end
  end
end
