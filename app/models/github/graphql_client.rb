require "faraday"
require "json"

module Github
  class GraphqlClient
    URL = "https://api.github.com/graphql"

    attr_reader :authors, :organization, :token

    def initialize(authors, organization, token)
      @authors = authors
      @organization = organization
      @token = token
    end

    def open_pull_requests
      query = <<-GRAPHQL
        query {
          search(
            query: "is:pr is:open archived:false #{authors_query} #{organization_query}",
            type: ISSUE,
            first: 100
          ) {
            issueCount
            edges {
              node {
                ... on PullRequest {
                  author {
                    login
                  }
                  number
                  title
                  isDraft
                  repository {
                    nameWithOwner
                  }
                  reviews {
                    totalCount
                  }
                  reviewRequests(first: 100) {
                    edges {
                      node {
                        requestedReviewer {
                          ... on User {
                            login
                          }
                          ... on Team {
                            name
                          }
                        }
                      }
                    }
                  }
                  createdAt
                  mergedAt
                  url
                }
              }
            }
          }
        }
      GRAPHQL

      response = connection.post do |req|
        req.body = JSON.generate({ query: query })
      end

      data = JSON.parse(response.body)

      if data["data"]
        search_result = data["data"]["search"]
        issue_count = search_result["issueCount"]
        edges = search_result["edges"]

        edges.map do |edge|
          PullRequest.from_graphql_node(edge["node"])
        end
      else
        errors = data["errors"]
        errors.each do |error|
          puts "Error: #{error['message']}"
        end
      end
    end

    private

    def authors_query
      @authors
        .split(",")
        .map { |author| "author:#{author.strip}" }
        .join(" ")
    end

    def connection
      @connection ||= Faraday.new(url: URL) do |faraday|
        faraday.authorization :Bearer, token
        faraday.headers["Content-Type"] = "application/json"
        faraday.adapter Faraday.default_adapter
      end
    end

    def organization_query
      return "" if @organization.empty?

      "org:#{@organization}"
    end
  end
end
