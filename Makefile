# Docker Compose files
DC=docker compose
COMPOSE_FILE=docker-compose.yml
COMPOSE_DEV_FILE=docker-compose.dev.yml

# Default environment
ENV=prod

# Optional follow flag for logs
FOLLOW?=

# Colors for pretty output
GREEN=\033[0;32m
NC=\033[0m # No Color

.PHONY: help up down restart ps logs clean build dev prod dd-dev dd-prod backup-db

help: ## Show this help menu
	@echo "Usage: make [TARGET] [ENV=prod|dev] [FOLLOW=f]"
	@echo "For logs: make logs [service_name] [ENV=prod|dev] [FOLLOW=f]"
	@echo ""
	@echo "Targets:"
	@awk '/^[a-zA-Z\-\_0-9]+:/ { \
		helpMessage = match(lastLine, /^## (.*)/); \
		if (helpMessage) { \
			helpCommand = substr($$1, 0, index($$1, ":")-1); \
			helpMessage = substr(lastLine, RSTART + 3, RLENGTH); \
			printf "  ${GREEN}%-15s${NC} %s\n", helpCommand, helpMessage; \
		} \
	} \
	{ lastLine = $$0 }' $(MAKEFILE_LIST)

## Start the containers
up:
	@if [ "$(ENV)" = "dev" ]; then \
		echo "Starting development environment..."; \
		$(DC) -f $(COMPOSE_DEV_FILE) up -d; \
	else \
		echo "Starting production environment..."; \
		$(DC) -f $(COMPOSE_FILE) up -d; \
	fi

## Stop the containers
down:
	@if [ "$(ENV)" = "dev" ]; then \
		echo "Stopping development environment..."; \
		$(DC) -f $(COMPOSE_DEV_FILE) down; \
	else \
		echo "Stopping production environment..."; \
		$(DC) -f $(COMPOSE_FILE) down; \
	fi

## Restart the containers
restart: down up

## Show running containers
ps:
	@if [ "$(ENV)" = "dev" ]; then \
		$(DC) -f $(COMPOSE_DEV_FILE) ps; \
	else \
		$(DC) -f $(COMPOSE_FILE) ps; \
	fi

## View container logs. Usage: make logs [service_name] [FOLLOW=f]
logs:
	@if [ "$(ENV)" = "dev" ]; then \
		if [ -n "$(word 2,$(MAKECMDGOALS))" ]; then \
			echo "Viewing logs for service $(word 2,$(MAKECMDGOALS)) in development environment..."; \
			$(DC) -f $(COMPOSE_DEV_FILE) logs $(if $(FOLLOW),-f) $(word 2,$(MAKECMDGOALS)); \
		else \
			echo "Viewing all logs in development environment..."; \
			$(DC) -f $(COMPOSE_DEV_FILE) logs $(if $(FOLLOW),-f); \
		fi \
	else \
		if [ -n "$(word 2,$(MAKECMDGOALS))" ]; then \
			echo "Viewing logs for service $(word 2,$(MAKECMDGOALS)) in production environment..."; \
			$(DC) -f $(COMPOSE_FILE) logs $(if $(FOLLOW),-f) $(word 2,$(MAKECMDGOALS)); \
		else \
			echo "Viewing all logs in production environment..."; \
			$(DC) -f $(COMPOSE_FILE) logs $(if $(FOLLOW),-f); \
		fi \
	fi

## Clean up containers, networks, and volumes
clean:
	@if [ "$(ENV)" = "dev" ]; then \
		$(DC) -f $(COMPOSE_DEV_FILE) down -v --remove-orphans; \
	else \
		$(DC) -f $(COMPOSE_FILE) down -v --remove-orphans; \
	fi

## Build or rebuild containers
build:
	@if [ "$(ENV)" = "dev" ]; then \
		$(DC) -f $(COMPOSE_DEV_FILE) build; \
	else \
		$(DC) -f $(COMPOSE_FILE) build; \
	fi

## Switch to development environment
dev:
	@make up ENV=dev FRONTEND_COMMAND="npm run dev"

## Switch to production environment
prod:
	@make up ENV=prod FRONTEND_COMMAND="npm run prod"

## Create a database backup
backup-db:
	@echo "Creating database backup..."
	@sh ./scripts/backup-db.sh
	@echo "Backup completed. New restore.sql file created in services/postgres/db/"

# Special target to allow passing service name as argument
%:
	@:
