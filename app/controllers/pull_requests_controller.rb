class PullRequestsController < ApplicationController
  def index
    render json: client.open_pull_requests
  end

  private

  def client
    @client ||= Github::Client.new
  end
end
