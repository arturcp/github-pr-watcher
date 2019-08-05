module Github
  class Client
    API = 'https://api.github.com'
    AUTHORS = %w[arturcp betocattani caduaraujo felipecvo joaoscheuermann].freeze

    def open_pull_requests(authors)
      response = connection.get do |req|
        req.url search_endpoint(build_list_for(authors.delete(' ')))
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

    def search_endpoint(authors)
      "/search/issues?q=#{authors}+state:open+org:youse-seguradora+is:pr"
    end

    def build_list_for(authors)
      authors.split(',').map do |author|
        "author:#{author}"
      end.join('+')
    end
  end
end
