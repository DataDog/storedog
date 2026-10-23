# Actual socket stalls, including reconnect: configuration inspection is insufficient.
require 'socket'
config = ActiveRecord::Base.connection_db_config.configuration_hash
options = {host: config[:host], port: config[:port] || 5432, dbname: config[:database],
           user: config[:username], password: config[:password], connect_timeout: 3, sslmode: 'disable'}
server = TCPServer.new('127.0.0.1', 0)
proxy_options = options.merge(host: '127.0.0.1', port: server.addr[1])
sockets = []
workers = []
forward = false
listener = Thread.new do
  loop do
    client = server.accept
    sockets << client
    if forward
      upstream = TCPSocket.new(options[:host], options[:port])
      sockets << upstream
      [[client, upstream], [upstream, client]].each do |source, destination|
        workers << Thread.new do
          begin
            IO.copy_stream(source, destination)
          rescue IOError, SystemCallError
          ensure
            source.close rescue nil
            destination.close rescue nil
          end
        end
      end
    end
    # Otherwise keep the accepted socket open without answering PostgreSQL startup.
  end
rescue IOError, Errno::EBADF
end
check_timeout = lambda do |&operation|
  started = Process.clock_gettime(Process::CLOCK_MONOTONIC)
  begin
    operation.call
    raise 'stalled connection did not time out'
  rescue PG::ConnectionBad
    elapsed = Process.clock_gettime(Process::CLOCK_MONOTONIC) - started
    raise "connect timeout took #{elapsed}s" unless elapsed.between?(2.5, 5.0)
  end
end
begin
  check_timeout.call { PG.connect(proxy_options) }
  forward = true
  connection = PG.connect(proxy_options)
  raise 'proxy not healthy' unless connection.exec('SELECT 1').getvalue(0, 0) == '1'
  forward = false
  check_timeout.call { connection.reset }
  healthy = PG.connect(options)
  raise 'subsequent connection unusable' unless healthy.exec('SELECT 1').getvalue(0, 0) == '1'
  puts 'PASS: stalled connect and reconnect respect 3s; subsequent connection works'
ensure
  connection&.finish unless connection&.finished?
  healthy&.finish unless healthy&.finished?
  server.close
  listener.join
  sockets.each { |socket| socket.close rescue nil }
  workers.each { |worker| worker.join(1) }
end
