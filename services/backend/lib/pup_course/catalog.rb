require 'digest'
require 'json'
require 'fileutils'

module PupCourse
  # Explicit invocation only. Per-product transactions allow interrupted seeds to resume.
  class Catalog
    PREFIX = 'pup-course-v1'.freeze
    def self.seed(count: 5000, output: Rails.root.join('tmp/pup-catalog-v1.json'), interrupt_after: nil)
      raise ArgumentError, 'products must be a positive multiple of 20' unless count.positive? && (count % 20).zero?
      connection = ActiveRecord::Base.connection
      raise 'another catalog seed is running' unless connection.select_value('SELECT pg_try_advisory_lock(137, 1)')
      begin
        existing = Spree::Product.where('slug LIKE ?', "#{PREFIX}-%").count
        raise 'use a fresh sandbox for a smaller catalog' if existing > count
        store = Spree::Store.default || raise('default store is required')
        shipping = Spree::ShippingCategory.find_or_create_by!(name: PREFIX)
        location = Spree::StockLocation.find_or_create_by!(name: PREFIX) { |x| x.active = true; x.propagate_all_variants = false }
        taxonomy = Spree::Taxonomy.find_or_create_by!(name: PREFIX, store: store)
        categories = 20.times.map do |i|
          Spree::Taxon.find_or_create_by!(taxonomy: taxonomy, name: format('%s-category-%02d', PREFIX, i)) do |x|
            x.parent = taxonomy.root
          end
        end
        option = Spree::OptionType.find_or_create_by!(name: PREFIX) { |x| x.presentation = 'Course size' }
        values = %w[small large].map do |name|
          Spree::OptionValue.find_or_create_by!(option_type: option, name: name) { |x| x.presentation = name.capitalize }
        end
        fixture = File.join(__dir__, 'product.png')
        blob_key = "#{PREFIX}/#{Digest::SHA256.file(fixture).hexdigest}.png"
        blob = ActiveStorage::Blob.find_by(key: blob_key)
        unless blob
          File.open(fixture, 'rb') do |io|
            blob = ActiveStorage::Blob.create_and_upload!(key: blob_key, io: io,
              filename: 'pup-product.png', content_type: 'image/png')
          end
        end
        records = count.times.map do |i|
          slug = format('%s-%05d', PREFIX, i)
          cents = 1000 + (i % 9000)
          product = nil
          Spree::Product.transaction do
            product = Spree::Product.find_or_initialize_by(slug: slug)
            product.assign_attributes(name: slug, description: "Course catalog product #{i}",
                                      available_on: Time.utc(2020, 1, 1), shipping_category: shipping)
            product.price = cents / 100.0
            product.sku = "#{slug}-master"
            product.stores = [store]
            product.option_types = [option]
            product.save!
            product.taxons = [taxonomy.root, categories[i % 20]]
            values.each_with_index do |value, n|
              variant = product.variants.find_or_initialize_by(sku: "#{slug}-#{n}")
              variant.price = (cents + n * 100) / 100.0
              variant.option_values = [value]
              variant.save!
            end
            product.variants_including_master.each do |variant|
              variant.prices.find_or_initialize_by(currency: 'USD').tap do |price|
                price.amount = variant.price
                price.save!
              end
              stock = variant.stock_items.find_or_initialize_by(stock_location: location)
              stock.assign_attributes(count_on_hand: 100, backorderable: false)
              stock.save!
            end
            unless product.master.images.exists?
              image = product.master.images.build(alt: slug)
              image.attachment.attach(blob)
              image.save!
            end
          end
          raise 'intentional seed interruption' if interrupt_after == i + 1
          { key: slug, id: product.id.to_s, category: i % 20, price_cents: cents,
            skus: ["#{slug}-master", "#{slug}-0", "#{slug}-1"] }
        end
        logical = { version: 1, products: records.map { |r| r.reject { |k, _| k == :id } },
                    image_sha256: Digest::SHA256.file(fixture).hexdigest }
        manifest = { version: 1, namespace: PREFIX, counts: { products: count, categories: 20, variants: count * 2 },
                     catalog_taxon_id: taxonomy.root.id.to_s,
                     categories: categories.each_with_index.map { |c, i| { key: i, id: c.id.to_s } },
                     products: records, content_sha256: Digest::SHA256.hexdigest(JSON.generate(logical)) }
        connection.execute('ANALYZE')
        FileUtils.mkdir_p(File.dirname(output))
        File.write("#{output}.tmp", JSON.pretty_generate(manifest) + "\n")
        File.rename("#{output}.tmp", output)
        manifest
      ensure
        connection.execute('SELECT pg_advisory_unlock(137, 1)')
      end
    end
  end
end
