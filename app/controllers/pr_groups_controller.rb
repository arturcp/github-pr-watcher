class PrGroupsController < ApplicationController
  def show
    @slug = params[:slug]
  end
end
