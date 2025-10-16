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

.PHONY: help prepare-release up down restart stop ps logs clean build dev prod dd-dev dd-prod backup-db

help: ## Show this help menu
	@echo "Usage: make [TARGET] [ENV=prod|dev] [FOLLOW=f]"
	@echo ""
	@echo "Commands that support ENV parameter:"
	@echo "  make up [ENV=prod|dev]           - Start containers"
	@echo "  make down [ENV=prod|dev]         - Stop containers"
	@echo "  make restart [ENV=prod|dev]      - Restart containers"
	@echo "  make ps [ENV=prod|dev]           - Show running containers"
	@echo "  make logs [service_name] [ENV=prod|dev] [FOLLOW=f] - View logs"
	@echo "  make clean [ENV=prod|dev]        - Clean up containers, networks, volumes"
	@echo "  make build [service_name] [ENV=prod|dev] - Build containers"
	@echo "  make stop [service_name] [ENV=prod|dev]  - Stop specific service"
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

## Generate production compose file for release
prepare-release:
	@echo "${GREEN}Transforming docker-compose.dev.yml to docker-compose.generated.yml...${NC}"
	@python3 transform_compose.py docker-compose.dev.yml docker-compose.generated.yml
	@echo "${GREEN}✓ Production compose file generated successfully!${NC}"
	@echo ""
	@echo "📄 Generated file: ${GREEN}docker-compose.generated.yml${NC}"
	@echo "Please review the generated file in another terminal or editor before proceeding."
	@echo ""
	@read -p "Have you reviewed the file? Replace docker-compose.yml? [y/N]: " confirm; \
	if [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ]; then \
		cp docker-compose.generated.yml docker-compose.yml; \
		echo "${GREEN}✓ docker-compose.yml has been updated!${NC}"; \
	else \
		echo "Skipped replacing docker-compose.yml. Generated file saved as docker-compose.generated.yml"; \
	fi

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
restart:
	@make down ENV=$(ENV)
	@make up ENV=$(ENV)

## Stop containers. Usage: make stop [service_name] [ENV=prod|dev]
stop:
	@if [ "$(ENV)" = "dev" ]; then \
		if [ -n "$(word 2,$(MAKECMDGOALS))" ]; then \
			echo "Stopping service $(word 2,$(MAKECMDGOALS)) in development environment..."; \
			$(DC) -f $(COMPOSE_DEV_FILE) stop $(word 2,$(MAKECMDGOALS)); \
		else \
			echo "Stopping all services in development environment..."; \
			$(DC) -f $(COMPOSE_DEV_FILE) stop; \
		fi \
	else \
		if [ -n "$(word 2,$(MAKECMDGOALS))" ]; then \
			echo "Stopping service $(word 2,$(MAKECMDGOALS)) in production environment..."; \
			$(DC) -f $(COMPOSE_FILE) stop $(word 2,$(MAKECMDGOALS)); \
		else \
			echo "Stopping all services in production environment..."; \
			$(DC) -f $(COMPOSE_FILE) stop; \
		fi \
	fi

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

## Build or rebuild containers. Usage: make build [service_name] [ENV=prod|dev]
build:
	@if [ "$(ENV)" = "dev" ]; then \
		if [ -n "$(word 2,$(MAKECMDGOALS))" ]; then \
			echo "Building service $(word 2,$(MAKECMDGOALS)) in development environment..."; \
			$(DC) -f $(COMPOSE_DEV_FILE) build $(word 2,$(MAKECMDGOALS)); \
		else \
			echo "Building all services in development environment..."; \
			$(DC) -f $(COMPOSE_DEV_FILE) build; \
		fi \
	else \
		if [ -n "$(word 2,$(MAKECMDGOALS))" ]; then \
			echo "Building service $(word 2,$(MAKECMDGOALS)) in production environment..."; \
			$(DC) -f $(COMPOSE_FILE) build $(word 2,$(MAKECMDGOALS)); \
		else \
			echo "Building all services in production environment..."; \
			$(DC) -f $(COMPOSE_FILE) build; \
		fi \
	fi

## Switch to development environment and run containers
dev:
	@make up ENV=dev FRONTEND_COMMAND="npm run dev"

## Switch to production environment and run containers
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
