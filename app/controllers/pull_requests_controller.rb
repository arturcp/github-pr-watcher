class PullRequestsController < ApplicationController
  def index
    if authors.present?
      render json: client.open_pull_requests(authors)
    else
      head :unprocessable_entity
    end
  end

  private

  def client
    @client ||= Github::Client.new
  end

  def authors
    params[:authors] || []
  end
end
