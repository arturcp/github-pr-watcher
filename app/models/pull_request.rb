# frozen_string_literal: true

class PullRequest
  attr_reader :approvals, :author, :comments, :created_at, :is_draft, :merged_at, :number, :repository, :reviewers, :reviews, :title, :url

  def initialize(approvals:, author:, comments:, created_at:, is_draft:, merged_at:, number:, repository:, reviewers:, reviews:, title:, url:)
    @approvals = approvals
    @author = author
    @comments = comments
    @created_at = created_at
    @is_draft = is_draft
    @merged_at = merged_at
    @number = number
    @repository = repository
    @reviewers = reviewers
    @reviews = reviews
    @title = title
    @url = url
  end

  def self.from_graphql_node(node)
    reviews = node["reviews"]["edges"].map { |review_edge| review_edge["node"]  }
    approvals = reviews&.count { |review| review["state"] == "APPROVED" } || 0
    comments = reviews&.count { |review| review["state"] == "COMMENTED" } || 0

    new(
      approvals: approvals,
      author: node.dig("author", "login"),
      comments: comments,
      created_at: node["createdAt"],
      is_draft: node["isDraft"],
      merged_at: node["mergedAt"],
      number: node["number"],
      repository: node.dig("repository", "nameWithOwner"),
      reviewers: node.dig("reviewRequests", "edges").map do |edge|
        edge.dig("node", "requestedReviewer", "login") ||
        edge.dig("node", "requestedReviewer", "name")
      end,
      reviews: reviews.map { |review| { author: review["author"]["login"], state: review["state"] } },
      title: node["title"],
      url: node["url"]
    )
  end
end
