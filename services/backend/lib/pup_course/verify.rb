# Run with rails runner against a disposable database restored from the bundled dump.
require Rails.root.join('lib/pup_course/catalog')
output = '/tmp/pup-catalog-test.json'
before = Spree::Product.where.not('slug LIKE ?', "#{PupCourse::Catalog::PREFIX}-%").count
begin
  PupCourse::Catalog.seed(count: 40, output: output, interrupt_after: 7)
rescue RuntimeError => e
  raise unless e.message == 'intentional seed interruption'
end
first = PupCourse::Catalog.seed(count: 40, output: output)
second = PupCourse::Catalog.seed(count: 40, output: output)
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
