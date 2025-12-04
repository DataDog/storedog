---
description: Help with database schema changes across services
---

Help with database schema changes across all Storedog services that use the database.

Arguments: $ARGUMENTS (optional: specific service name or table name)

Tasks to perform:

1. **Identify Database-Connected Services:**
   * Backend (Rails/Spree): Main product and order database
   * Ads (Java): Advertisement storage
   * Ads (Python): Advertisement storage (alternative implementation)
   * Discounts (Flask): Discount codes and types
   * DBM (Flask): Items and preorder_items tables

1. **Check for Schema Changes:**
   * If specific files are mentioned, identify which service owns them
   * Look for model changes in:
     * Backend: services/backend/app/models/
     * Ads (Java): services/ads/java/src/main/java/com/datadog/ads/model/
     * Ads (Python): services/ads/python/models.py
     * Discounts: services/discounts/models.py
     * DBM: services/dbm/dbm.py
   * Identify new columns, tables, or relationships

1. **Migration Requirements:**
   * For Rails (Backend): Check if db/migrate/ needs new migration files
   * For Python services: Check if SQLAlchemy models need updates
   * For Java: Check if schema.sql or Flyway migrations are needed
   * Identify any cross-service schema dependencies

1. **Backup Reminder:**
   * Remind about the backup script: `sh ./scripts/backup-db.sh`
   * Explain that it creates services/postgres/db/restore.sql
   * Suggest running backup before migrations

1. **Generate Migration Commands:**
   * Backend: `docker compose exec backend bundle exec rails generate migration <MigrationName>`
   * Backend: `docker compose exec backend bundle exec rake db:migrate`
   * Python services: Show SQLAlchemy model changes and restart requirements
   * Java: Show schema.sql updates needed

1. **Cross-Service Impact:**
   * Identify if changes affect multiple services
   * Check for shared tables (advertisements, products, etc.)
   * Warn about potential service restart requirements
   * Suggest testing order: database → backend → dependent services

1. **Kubernetes Considerations:**
   * Note if StatefulSet for PostgreSQL needs updating
   * Check if init containers or jobs are needed for migrations
   * Remind about PersistentVolumeClaim backup before schema changes
