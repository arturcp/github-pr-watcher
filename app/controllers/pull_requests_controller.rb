class PullRequestsController < ApplicationController
  def index
    if authors.present?
      render json: client.open_pull_requests
    else
      head :unprocessable_entity
    end
  end

  private

  def client
    @client ||= Github::Client.new(authors, organization, token)
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
end
