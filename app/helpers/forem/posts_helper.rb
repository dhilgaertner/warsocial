module Forem
  module PostsHelper
    def avatar(user, options = {})
      image_tag(avatar_url(user), :alt => "Gravatar")
    end

    def avatar_url(user)
      return user.gravatar_url(:default => image_path("default_avatar2.png"), :size => 80)
    end

    def default_gravatar
      image = Forem.default_gravatar_image

      case
      when image && URI(image).absolute?
        image
      when image
        request.protocol +
          request.host_with_port +
          path_to_image(image)
      else
        Forem.default_gravatar
      end
    end
  end
end
