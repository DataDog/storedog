# Run with rails runner against a disposable database restored from the bundled dump.
require Rails.root.join('lib/pup_course/catalog')
output = '/tmp/pup-catalog-test.json'
before = Spree::Product.where.not('slug LIKE ?', "#{PupCourse::Catalog::PREFIX}-%").count
begin
  PupCourse::Catalog.seed(count: 140, output: output, interrupt_after: 107)
rescue RuntimeError => e
  raise unless e.message == 'intentional seed interruption'
end
raise 'completed batch was not retained' unless Spree::Product.where('slug LIKE ?', "#{PupCourse::Catalog::PREFIX}-%").count == 100
first = PupCourse::Catalog.seed(count: 140, output: output)
second = PupCourse::Catalog.seed(count: 140, output: output)
raise 'manifest changed' unless first == second
raise 'sample changed' unless before == Spree::Product.where.not('slug LIKE ?', "#{PupCourse::Catalog::PREFIX}-%").count
first[:products].each do |row|
  product = Spree::Product.find(row[:id])
  raise 'variants missing' unless product.variants.count == 2
  raise 'image missing' unless product.master.images.first.attachment.attached?
  raise 'categories missing' unless product.taxons.count == 2
  product.variants_including_master.each do |variant|
    raise 'stock missing' unless variant.stock_items.where(count_on_hand: 100).exists?
    raise 'price missing' unless variant.prices.where(currency: 'USD').exists?
  end
end
connection = ActiveRecord::Base.connection
raise 'statement timeout missing' unless connection.select_value('SHOW statement_timeout') == '5s'
pid = connection.select_value('SELECT pg_backend_pid()')
begin
  connection.execute('SELECT pg_sleep(6)')
  raise 'query not cancelled'
rescue ActiveRecord::QueryCanceled
  raise 'connection replaced' unless connection.select_value('SELECT pg_backend_pid()') == pid
  raise 'connection unusable' unless connection.select_value('SELECT 1') == 1
end
puts 'PASS: seed resume, idempotency, manifest, associations, cancellation and connection reuse'
raise 'lock timeout missing' unless connection.select_value('SHOW lock_timeout') == '1s'
config = ActiveRecord::Base.connection_db_config.configuration_hash
raise 'connect timeout missing' unless config[:connect_timeout] == 3
holder = PG.connect(host: config[:host], port: config[:port], dbname: config[:database],
                    user: config[:username], password: config[:password], connect_timeout: 3)
begin
  holder.exec('BEGIN')
  id = Integer(first[:products].first[:id])
  holder.exec("SELECT id FROM spree_products WHERE id = #{id} FOR UPDATE")
  begin
    connection.execute("SELECT id FROM spree_products WHERE id = #{id} FOR UPDATE")
    raise 'lock not cancelled'
  rescue ActiveRecord::LockWaitTimeout
    raise 'connection unusable after lock cancellation' unless connection.select_value('SELECT 1') == 1
  end
ensure
  holder.exec('ROLLBACK')
  holder.close
end
puts 'PASS: lock cancellation and connect timeout configuration'
client = ActionDispatch::Integration::Session.new(Rails.application)
requests = first[:categories].map { |category| [category[:id], first[:products].select { |p| p[:category] == category[:key] }, 1] }
(1..6).each { |page| requests << [first[:catalog_taxon_id], first[:products], page] }
requests.each do |taxon, products, page|
  client.get('/api/v2/storefront/products', params: { filter: { taxons: taxon }, sort: 'name', per_page: 25, page: page,
             include: 'default_variant,images,primary_variant,taxons' })
  raise "API status #{client.response.status}: #{client.response.body[0,200]}" unless client.response.status == 200
  actual = JSON.parse(client.response.body)['data'].map { |product| product['id'] }
  expected = products.sort_by { |p| p[:key] }.slice((page - 1) * 25, 25).map { |p| p[:id] }
  raise 'API pagination mismatch' unless actual == expected
end
puts 'PASS: real Rack API, all categories and full/partial catalog pages'
if ENV['PUP_TEST_SCALE']
  size = Integer(ENV.fetch('PUP_TEST_SCALE'))
  started = Process.clock_gettime(Process::CLOCK_MONOTONIC)
  large = PupCourse::Catalog.seed(count: size, output: output)
  elapsed = Process.clock_gettime(Process::CLOCK_MONOTONIC) - started
  raise 'scaled manifest changed' unless large == PupCourse::Catalog.seed(count: size, output: output)
  ids = large[:products].map { |row| row[:id] }
  raise 'scaled variant counts' unless Spree::Variant.where(product_id: ids).count == size * 3
  raise 'scaled image counts' unless Spree::Image.where(viewable_type: 'Spree::Variant', viewable_id: Spree::Variant.where(product_id: ids, is_master: true)).count == size
  client.get('/api/v2/storefront/products', params: { filter: { taxons: large[:catalog_taxon_id] }, sort: 'name', per_page: 25, page: (size / 25.0).ceil,
             include: 'default_variant,images,primary_variant,taxons' })
  raise 'scaled final page' unless client.response.status == 200 && JSON.parse(client.response.body)['data'].last['id'] == large[:products].last[:id]
  puts "PASS: #{size}-product seed in #{elapsed.round(2)} seconds; repeat manifest, counts and final API page"
end
