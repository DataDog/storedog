module Api
    module V2
      class CustomController < ApplicationController
        def about_us
          # Sleep for 3.1 seconds to introduce a delay before responding
          sleep 3.1
          # Set the custom header
          response.set_header('Timing-Allow-Origin', '*')

          render json: {image: "/assets/t-shirt-0.png"}, status: :ok
        end
      end
    end
  end