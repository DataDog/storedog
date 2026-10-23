namespace :pup_course do
  desc 'Explicit, resumable course-only catalog seed (default 5000 products)'
  task seed: :environment do
    require Rails.root.join('lib/pup_course/catalog')
    PupCourse::Catalog.seed(count: Integer(ENV.fetch('PUP_CATALOG_PRODUCTS', '5000')),
                           output: ENV.fetch('PUP_CATALOG_MANIFEST', Rails.root.join('tmp/pup-catalog-v1.json').to_s))
  end
end
