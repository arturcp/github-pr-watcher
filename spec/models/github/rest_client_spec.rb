require "rails_helper"

RSpec.describe Github::RestClient, type: :model do
  let(:authors) { "author1,author2" }
  let(:organization) { "test_org" }
  let(:token) { "test_token" }
  let(:client) { described_class.new(authors, organization, token) }

  describe "#initialize" do
    it "assigns authors" do
      expect(client.authors).to eq(authors)
    end

    it "assigns organization" do
      expect(client.organization).to eq(organization)
    end

    it "assigns token" do
      expect(client.token).to eq(token)
    end
  end

  describe "#open_pull_requests" do
    let(:response_body) { "response_body" }
    let(:faraday_response) { double("Faraday::Response", body: response_body) }

    before do
      allow(client).to receive(:connection).and_return(double("Faraday::Connection", get: faraday_response))
    end

    it "returns the response body" do
      expect(client.open_pull_requests).to eq(response_body)
    end
  end

  describe "#connection" do
    it "returns a Faraday connection" do
      expect(client.send(:connection)).to be_a(Faraday::Connection)
    end
  end

  describe "#search_endpoint" do
    context "when organization is present" do
      it "includes the organization in the endpoint" do
        expect(client.send(:search_endpoint, "author1+author2")).to include("+org:#{organization}")
      end
    end

    context "when organization is not present" do
      let(:organization) { nil }

      it "does not include the organization in the endpoint" do
        expect(client.send(:search_endpoint, "author1+author2")).not_to include("+org:")
      end
    end
  end

  describe "#build_list_for" do
    it "builds a list of authors for the search query" do
      expect(client.send(:build_list_for, authors)).to eq("author:author1+author:author2")
    end
  end
end
