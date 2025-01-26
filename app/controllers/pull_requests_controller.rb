class PullRequestsController < ApplicationController
  skip_before_action :verify_authenticity_token

  def index
    if authors.present?
      pull_requests = Rails.cache.fetch(cache_key, expires_in: 10.minutes) do
        client.open_pull_requests
      end

      render json: pull_requests
    else
      head :unprocessable_entity
    end
  end

  private

  def client
    @client ||= Github::GraphqlClient.new(authors, organization, token)
  end

  def authors
    params[:authors] || []
  end

  def organization
    params[:organization].to_s
  end

  def token
    params[:token] || []
  end

  def group
    params[:group].to_s
  end

  def cache_key
    group ? "#{group}_pull_requests" : "pull_requests_#{authors}_#{organization}"
  end
end
