require 'compass/import-once/activate'
# Require any additional compass plugins here.

# Set this to the root of your project when deployed:
http_path = "app/"
css_dir = "dist.dev/css"
sass_dir = "app/sass/"
images_path = "app/images/"
images_dir = "dist.dev/images/"
fonts_path = "dist.dev/fonts/"
javascripts_dir = "app/js/"

# You can select your preferred output style here (can be overridden via the command line):
# output_style = :expanded or :nested or :compact or :compressed
output_style = :expanded

# To enable relative paths to assets via compass helper functions. Uncomment:
# relative_assets = true
relative_assets = false

# To disable debugging comments that display the original location of your selectors. Uncomment:
# line_comments = false
line_comments = true


# If you prefer the indented syntax, you might want to regenerate this
# project again passing --syntax sass, or you can uncomment this:
# preferred_syntax = :sass
preferred_syntax = :scss
# and then run:
# sass-convert -R --from scss --to sass sass scss && rm -rf sass && mv scss sass
sourcemap = true