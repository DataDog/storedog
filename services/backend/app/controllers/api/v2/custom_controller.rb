module Api
    module V2
      class CustomController < ApplicationController
        def about_us
          # Sleep for 0.6 seconds to introduce a delay before responding
          sleep 0.6

          render json: {image: "https://storage.googleapis.com/shopist-io-large-image-for-rum-lcp/high-res-kitchen-table.jpg"}, status: :ok
        end
      end
    end
  end