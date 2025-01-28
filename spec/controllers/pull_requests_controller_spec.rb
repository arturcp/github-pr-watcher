require 'rails_helper'

RSpec.describe PullRequestsController, type: :controller do
  let(:authors) { ['user1', 'user2'] }
  let(:organization) { 'myorg' }
  let(:token) { 'ghp_1234567890abcdef' }
  let(:group) { 'mygroup' }
  let(:pull_requests) { [ { id: 1, title: 'PR 1' }, { id: 2, title: 'PR 2' } ] }

  before do
    Rails.cache = ActiveSupport::Cache::MemoryStore.new
  end

  after do
    Rails.cache = ActiveSupport::Cache::NullStore.new
  end

  describe 'GET #index' do
    context 'when authors are present' do
      before do
        allow_any_instance_of(Github::GraphqlClient).to receive(:open_pull_requests).and_return(pull_requests)
        expect_any_instance_of(Github::GraphqlClient).to receive(:open_pull_requests)
        get :index, params: { authors: authors, organization: organization, token: token, group: group }
      end

      it 'returns a successful response' do
        expect(response).to be_successful
      end

      it 'returns pull requests as JSON' do
        expect(JSON.parse(response.body)).to eq(pull_requests.as_json)
      end

      it 'caches the response' do
        expect(Rails.cache.exist?("#{group}_pull_requests_#{authors}_#{organization}_#{token.last(7)}")).to be true
      end
    end

    context 'when authors are not present' do
      before do
        get :index, params: { organization: organization, token: token, group: group }
      end

      it 'returns a 422 Unprocessable Entity status' do
        expect(response).to have_http_status(:unprocessable_entity)
      end

      it 'does not cache the response' do
        expect(Rails.cache.exist?("#{group}_pull_requests_[]_#{organization}_#{token.last(7)}")).to be false
      end
    end
  end

  describe 'cache_key generation' do
    it 'generates the correct cache key' do
      controller.params = { authors: authors, organization: organization, token: token, group: group }
      expect(controller.send(:cache_key)).to eq("#{group}_pull_requests_#{authors}_#{organization}_#{token.last(7)}")
    end
  end

  describe 'client initialization' do
    it 'initializes the client with the correct parameters' do
      controller.params = { authors: authors, organization: organization, token: token }
      client = controller.send(:client)
      expect(client.instance_variable_get(:@authors)).to eq(authors)
      expect(client.instance_variable_get(:@organization)).to eq(organization)
      expect(client.instance_variable_get(:@token)).to eq(token)
    end
  end
end
