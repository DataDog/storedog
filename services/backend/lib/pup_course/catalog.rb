require 'digest'
require 'json'
require 'fileutils'
require 'set'

module PupCourse
  # Explicit invocation only. Bounded batch transactions allow interrupted seeds to resume.
  class Catalog
    PREFIX = 'pup-course-v1'.freeze
    # These models are used only by explicit setup. Application callbacks, indexes,
    # prepared statements and caches remain enabled for normal requests.
    def self.table(name)
      @tables ||= {}
      @tables[name] ||= Class.new(ActiveRecord::Base) { self.table_name = name }
    end

    def self.ensure_rows(name, rows, keys, scope)
      model = table(name)
      present = model.where(scope).pluck(*keys).map { |value| Array(value) }.to_set
      missing = rows.reject { |row| present.include?(keys.map { |key| row.fetch(key) }) }
      return if missing.empty?
      now = Time.current
      missing.each do |row|
        row[:created_at] = now if model.column_names.include?('created_at')
        row[:updated_at] = now if model.column_names.include?('updated_at')
      end
      model.insert_all!(missing)
    end

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
        # Analyze the shared fixture once; bulk associations do not enqueue one job per product.
        blob.analyze unless blob.analyzed?
        records = []
        count.times.each_slice(100) do |indices|
          # A crash rolls back this bounded batch; earlier batches remain reusable.
          ActiveRecord::Base.transaction do
            slugs = indices.to_h { |i| [i, format('%s-%05d', PREFIX, i)] }
            ensure_rows('spree_products', indices.map { |i|
              { slug: slugs[i], name: slugs[i], description: "Course catalog product #{i}",
                available_on: Time.utc(2020, 1, 1), shipping_category_id: shipping.id }
            }, [:slug], slug: slugs.values)
            ids = table('spree_products').where(slug: slugs.values).pluck(:slug, :id).to_h
            product_ids = ids.values
            variant_rows = indices.flat_map { |i|
              %w[master 0 1].each_with_index.map { |suffix, position|
                { sku: "#{slugs[i]}-#{suffix}", product_id: ids[slugs[i]],
                  is_master: suffix == 'master', position: position, track_inventory: true }
              }
            }
            ensure_rows('spree_variants', variant_rows, [:sku], product_id: product_ids)
            variants = table('spree_variants').where(product_id: product_ids).pluck(:sku, :id).to_h
            variant_ids = variants.values
            price_rows = indices.flat_map { |i|
              %w[master 0 1].map { |suffix|
                { variant_id: variants.fetch("#{slugs[i]}-#{suffix}"), currency: 'USD',
                  amount: (1000 + i % 9000 + (suffix == '1' ? 100 : 0)) / 100.0 }
              }
            }
            ensure_rows('spree_prices', price_rows, [:variant_id, :currency], variant_id: variant_ids)
            ensure_rows('spree_stock_items', variant_ids.map { |id|
              { variant_id: id, stock_location_id: location.id, count_on_hand: 100, backorderable: false }
            }, [:variant_id, :stock_location_id], variant_id: variant_ids, stock_location_id: location.id)
            ensure_rows('spree_products_stores', product_ids.map { |id| { product_id: id, store_id: store.id } },
                        [:product_id, :store_id], product_id: product_ids)
            ensure_rows('spree_products_taxons', indices.flat_map { |i|
              [taxonomy.root.id, categories[i % 20].id].map { |id| { product_id: ids[slugs[i]], taxon_id: id, position: i + 1 } }
            }, [:product_id, :taxon_id], product_id: product_ids)
            ensure_rows('spree_product_option_types', product_ids.map { |id|
              { product_id: id, option_type_id: option.id, position: 1 }
            }, [:product_id, :option_type_id], product_id: product_ids)
            ensure_rows('spree_option_value_variants', indices.flat_map { |i|
              values.each_with_index.map { |value, n| { variant_id: variants.fetch("#{slugs[i]}-#{n}"), option_value_id: value.id } }
            }, [:variant_id, :option_value_id], variant_id: variant_ids)
            masters = indices.map { |i| variants.fetch("#{slugs[i]}-master") }
            ensure_rows('spree_assets', indices.map { |i|
              { viewable_type: 'Spree::Variant', viewable_id: variants.fetch("#{slugs[i]}-master"),
                type: 'Spree::Image', position: 1, alt: slugs[i] }
            }, [:viewable_type, :viewable_id, :type], viewable_type: 'Spree::Variant', viewable_id: masters)
            images = table('spree_assets').where(viewable_type: 'Spree::Variant', viewable_id: masters, type: 'Spree::Image').pluck(:id)
            ensure_rows('active_storage_attachments', images.map { |id|
              { name: 'attachment', record_type: Spree::Image.base_class.name, record_id: id, blob_id: blob.id }
            }, [:name, :record_type, :record_id, :blob_id], record_type: Spree::Image.base_class.name, record_id: images)
            indices.each do |i|
              raise 'intentional seed interruption' if interrupt_after == i + 1
              slug = slugs[i]
              records << { key: slug, id: ids[slug].to_s, category: i % 20, price_cents: 1000 + i % 9000,
                           skus: ["#{slug}-master", "#{slug}-0", "#{slug}-1"] }
            end
          end
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
