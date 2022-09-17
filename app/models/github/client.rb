module Github
  class Client
    API = 'https://api.github.com'

    attr_reader :authors, :organization, :token

    def initialize(authors, organization, token)
      @authors = authors
      @organization = organization
      @token = token
    end

    def open_pull_requests
      response = connection.get do |req|
        req.url search_endpoint(build_list_for(authors.delete(' ')))
        req.headers['Accept'] = 'application/vnd.github.v3+json'
        req.headers['Authorization'] = "token #{token}"
      end

      response.body
    end

    private

    def connection
      @connection ||= Faraday.new(url: API) do |builder|
        builder.response :logger, Rails.logger, bodies: true
        builder.use :instrumentation
        builder.adapter(*Faraday.default_adapter)
      end
    end

    def search_endpoint(authors)
      @endpoint ||= begin
        org = organization.present? ? "+org:#{organization}" : ''
        "/search/issues?q=#{authors}+state:open+is:pr#{org}"
      end
    end

    def build_list_for(authors)
      authors.split(',').map do |author|
        "author:#{author}"
      end.join('+')
    end
  end
end
