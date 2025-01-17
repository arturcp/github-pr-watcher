# frozen_string_literal: true

class PullRequest
  attr_reader :author, :number, :title, :repository, :reviews, :reviewers, :created_at, :merged_at, :url

  def initialize(author:, number:, title:, repository:, reviews:, reviewers:, created_at:, merged_at:, url:)
    @author = author
    @number = number
    @title = title
    @repository = repository
    @reviews = reviews
    @reviewers = reviewers
    @created_at = created_at
    @merged_at = merged_at
    @url = url
  end

  def self.from_graphql_node(node)
    new(
      author: node.dig("author", "login"),
      number: node["number"],
      title: node["title"],
      repository: node.dig("repository", "nameWithOwner"),
      reviews: node.dig("reviews", "totalCount"),
      reviewers: node.dig("reviewRequests", "edges").map do |edge|
        edge.dig("node", "requestedReviewer", "login") ||
          edge.dig("node", "requestedReviewer", "name")
      end,
      created_at: node["createdAt"],
      merged_at: node["mergedAt"],
      url: node["url"]
    )
  end
end
