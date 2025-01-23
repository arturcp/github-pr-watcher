class PullRequestsController < ApplicationController
  skip_before_action :verify_authenticity_token

  def index
    puts params
    if authors.present?
      render json: client.open_pull_requests
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
end
