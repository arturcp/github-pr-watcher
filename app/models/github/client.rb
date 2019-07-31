module Github
  class Client
    API = 'https://api.github.com'
    AUTHORS = %w[arturcp betocattani caduaraujo felipecvo joaoscheuermann].freeze

    def open_pull_requests
      response = connection.get do |req|
        req.url search_endpoint
        req.headers['Accept'] = 'application/vnd.github.v3+json'
        req.headers['Authorization'] = "token #{ENV['TOKEN']}"
      end

      response.body
    end

    private

    def connection
      @connection ||= Faraday.new(url: API) do |builder|
        builder.response :logger, Rails.logger, bodies: true
        builder.response :logger, ::Logger.new('log/github_client.log'), bodies: true unless Rails.env.test?
        builder.use :instrumentation
        builder.adapter(*Faraday.default_adapter)
      end
    end

    def search_endpoint
      "/search/issues?q=#{authors}+state:open+org:youse-seguradora+is:pr"
    end

    def authors
      AUTHORS.map do |author|
        "author:#{author}"
      end.join('+')
    end
  end
end
