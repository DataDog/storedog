require 'erb'
require 'yaml'
%w[PUP_DB_CONNECT_TIMEOUT PUP_DB_STATEMENT_TIMEOUT_MS PUP_DB_LOCK_TIMEOUT_MS].each { |name| ENV.delete(name) }
config = YAML.load(ERB.new(File.read('/app/config/database.yml')).result, aliases: true)['production']
raise 'default timeout behavior changed' if config.key?('connect_timeout') || config.key?('variables')
raise 'default pool changed' unless config['pool'] == Integer(ENV.fetch('DB_POOL', ENV.fetch('MAX_THREADS', '25')))
puts 'PASS: unset course settings preserve default database config'
