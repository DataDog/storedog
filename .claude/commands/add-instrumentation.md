---
description: Help add Datadog instrumentation to a file or service
---

Help add Datadog instrumentation to a file or service in the Storedog application.

Arguments: $ARGUMENTS (file path or service name)

Tasks to perform:

1. Read the specified file or identify files in the service directory
1. Determine the language/framework:
   * JavaScript/TypeScript: Next.js frontend, Puppeteer
   * Ruby: Rails backend, Sidekiq worker
   * Python: Flask services (ads-python, discounts, dbm)
   * Java: Spring ads service
1. Check for existing Datadog imports and initialization:
   * Node.js: `dd-trace`, `@datadog/browser-rum`
   * Ruby: `ddprofrb`, Datadog initializers
   * Python: `ddtrace`, `from ddtrace import tracer`
   * Java: Datadog Java agent in Dockerfile
1. Review existing instrumentation patterns from similar files:
   * Frontend: pages/_app.tsx for RUM, tracer.init() patterns
   * Backend: config/initializers/datadog.rb
   * Python: app.py files with ddtrace patches
   * Java: Dockerfile with -javaagent
1. Suggest appropriate instrumentation additions:
   * Custom spans for important operations
   * Proper service naming and tagging
   * Log injection configuration
   * Database query instrumentation
   * Error tracking setup
1. Reference relevant Datadog documentation for the specific language
1. Check environment variables needed (DD_ENV, DD_VERSION, DD_SERVICE, etc.)
