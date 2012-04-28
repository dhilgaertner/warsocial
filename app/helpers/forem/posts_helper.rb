module Forem
  module PostsHelper
    def avatar(user, options = {})
      if (email = user.try(:email)).present?
        image_tag(avatar_url(email, options), :alt => "Gravatar")
      end
    end

    def avatar_url(email, options = {})
      image_path("default_avatar2.png")
      #require 'digest/md5' unless defined?(Digest::MD5)
      #md5 = Digest::MD5.hexdigest(email.to_s.strip.downcase)
      #
      #options[:s] = options.delete(:size) || 60
      #options[:d] = options.delete(:default) || default_gravatar
      #options.delete(:d) unless options[:d]
      #"http://www.gravatar.com/avatar/#{md5}?#{options.to_param}"
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
