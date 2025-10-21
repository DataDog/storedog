# =============================================================================
# Storedog Application Makefile
# =============================================================================
# This Makefile provides convenient commands for managing the Storedog application
# using Docker Compose. It supports both development and production environments.
#
# Quick Start:
#   make help           - Show all available commands
#   make dev            - Start development environment
#   make prod           - Start production environment
#   make frontend-prod  - Start with frontend in production mode
#   make down           - Stop all containers
#
# =============================================================================

# Docker Compose Configuration
DC=docker compose
COMPOSE_FILE=docker-compose.yml              # Production compose file
COMPOSE_DEV_FILE=docker-compose.dev.yml      # Development compose file

# Default Environment Settings
ENV=prod                                     # Default to production (options: prod, dev)

# Optional Parameters
FOLLOW?=                                     # Set to 'f' to follow logs in real-time
NO_CACHE?=                                   # Set to '1' to build without cache

# Terminal Colors for Better UX
GREEN=\033[0;32m
NC=\033[0m # No Color

# Helper function to select the appropriate compose file based on environment
define get_compose_file
$(if $(filter dev,$(ENV)),$(COMPOSE_DEV_FILE),$(COMPOSE_FILE))
endef

.PHONY: help prepare-release up down restart stop ps logs clean build dev prod dd-dev dd-prod backup-db frontend-prod

help: ## Show this comprehensive help menu
	@echo "${GREEN}===============================================================================${NC}"
	@echo "${GREEN}                        Storedog Application Commands${NC}"
	@echo "${GREEN}===============================================================================${NC}"
	@echo ""
	@echo "${GREEN}🚀 Quick Start Commands:${NC}"
	@echo "  make dev                         - Start development environment"
	@echo "  make prod                        - Start production environment"
	@echo "  make frontend-prod               - Start with frontend in production mode"
	@echo "  make down                        - Stop all containers"
	@echo ""
	@echo "${GREEN}📋 Environment Management:${NC}"
	@echo "  make up [ENV=prod|dev]           - Start containers in specified environment"
	@echo "  make down [ENV=prod|dev]         - Stop containers (auto-detects environment)"
	@echo "  make restart [ENV=prod|dev]      - Restart containers"
	@echo "  make ps [ENV=prod|dev]           - Show running containers"
	@echo "  make clean [ENV=prod|dev]        - Clean up containers, networks, and volumes"
	@echo ""
	@echo "${GREEN}🔧 Build & Development:${NC}"
	@echo "  make build [service] [ENV=prod|dev] [NO_CACHE=1] - Build containers"
	@echo "  make stop [service] [ENV=prod|dev]               - Stop specific service"
	@echo "  make logs [service] [ENV=prod|dev] [FOLLOW=f]    - View logs"
	@echo ""
	@echo "${GREEN}🎯 Special Operations:${NC}"
	@echo "  make prepare-release             - Generate production compose file"
	@echo "  make backup-db                   - Create database backup"
	@echo ""
	@echo "${GREEN}📖 Usage Examples:${NC}"
	@echo "  make logs frontend FOLLOW=f      - Follow frontend logs in real-time"
	@echo "  make build backend NO_CACHE=1    - Rebuild backend without cache"
	@echo "  make up ENV=dev                  - Start development environment"
	@echo ""
	@echo "${GREEN}💡 Parameters:${NC}"
	@echo "  ENV=prod|dev                     - Environment (default: prod)"
	@echo "  FOLLOW=f                         - Follow logs in real-time"
	@echo "  NO_CACHE=1                       - Build without Docker cache"
	@echo ""
	@echo "${GREEN}📚 Available Targets:${NC}"
	@awk '/^[a-zA-Z\-\_0-9]+:/ { \
		helpMessage = match(lastLine, /^## (.*)/); \
		if (helpMessage) { \
			helpCommand = substr($$1, 0, index($$1, ":")-1); \
			helpMessage = substr(lastLine, RSTART + 3, RLENGTH); \
			printf "  ${GREEN}%-15s${NC} %s\n", helpCommand, helpMessage; \
		} \
	} \
	{ lastLine = $$0 }' $(MAKEFILE_LIST)
	@echo ""
	@echo "${GREEN}===============================================================================${NC}"

## Generate production compose file for release (interactive)
prepare-release:
	@echo "${GREEN}Transforming docker-compose.dev.yml to docker-compose.generated.yml...${NC}"
	@python3 scripts/transform_compose.py docker-compose.dev.yml docker-compose.generated.yml
	@echo "${GREEN}✓ Production compose file generated successfully!${NC}"
	@echo ""
	@echo "📄 Generated file: ${GREEN}docker-compose.generated.yml${NC}"
	@echo "Please review the generated file in another terminal or editor before proceeding."
	@echo ""
	@read -p "Have you reviewed the file? Replace docker-compose.yml? [y/N]: " confirm; \
	if [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ]; then \
		cp docker-compose.generated.yml docker-compose.yml; \
		echo "${GREEN}✓ docker-compose.yml has been updated!${NC}"; \
		rm -f docker-compose.generated.yml; \
		echo "${GREEN}✓ Cleaned up docker-compose.generated.yml${NC}"; \
	else \
		echo "Skipped replacing docker-compose.yml. Generated file saved as docker-compose.generated.yml"; \
	fi

## Start containers in specified environment (supports NO_CACHE=1)
up:
	@if [ "$(NO_CACHE)" = "1" ]; then \
		echo "Building and starting $(ENV) environment without cache..."; \
		$(DC) -f $(call get_compose_file) build --no-cache; \
		$(DC) -f $(call get_compose_file) up -d; \
	else \
		echo "Starting $(ENV) environment..."; \
		$(DC) -f $(call get_compose_file) up -d; \
	fi
	@echo "${GREEN}View the frontend at http://localhost${NC}"

## Stop containers (auto-detects which compose file to use)
down:
	@# Find any running Storedog containers to detect which compose file was used
	@CONTAINER=$$(docker ps -a --format "{{.Names}}" | grep -E "^(storedog-|lab-)" | head -1); \
	if [ -n "$$CONTAINER" ]; then \
		COMPOSE_FILE_USED=$$(docker inspect $$CONTAINER --format '{{index .Config.Labels "com.docker.compose.project.config_files"}}'); \
		echo "Detected compose file ($$COMPOSE_FILE_USED), stopping containers..."; \
		$(DC) -f $$COMPOSE_FILE_USED down; \
	else \
		echo "No containers found, containers may already be stopped."; \
	fi

## Restart containers in specified environment
restart:
	@make down ENV=$(ENV)
	@make up ENV=$(ENV)

## Stop specific service or all services in environment
stop:
	@SERVICE=$(word 2,$(MAKECMDGOALS)); \
	if [ -n "$$SERVICE" ]; then \
		echo "Stopping service $$SERVICE in $(ENV) environment..."; \
		$(DC) -f $(call get_compose_file) stop $$SERVICE; \
	else \
		echo "Stopping all services in $(ENV) environment..."; \
		$(DC) -f $(call get_compose_file) stop; \
	fi

## Show running containers for current environment
ps:
	@$(DC) -f $(call get_compose_file) ps

## View container logs (supports service name and FOLLOW=f)
logs:
	@SERVICE=$(word 2,$(MAKECMDGOALS)); \
	if [ -n "$$SERVICE" ]; then \
		echo "Viewing logs for service $$SERVICE in $(ENV) environment..."; \
		$(DC) -f $(call get_compose_file) logs $(if $(FOLLOW),-f) $$SERVICE; \
	else \
		echo "Viewing all logs in $(ENV) environment..."; \
		$(DC) -f $(call get_compose_file) logs $(if $(FOLLOW),-f); \
	fi

## Clean up containers, networks, and volumes (destructive)
clean:
	@$(DC) -f $(call get_compose_file) down -v --remove-orphans

## Build containers (supports service name, NO_CACHE=1)
build:
	@SERVICE=$(word 2,$(MAKECMDGOALS)); \
	CACHE_FLAG=""; \
	if [ "$(NO_CACHE)" = "1" ]; then \
		CACHE_FLAG="--no-cache"; \
	fi; \
	if [ -n "$$SERVICE" ]; then \
		echo "Building service $$SERVICE in $(ENV) environment..."; \
		$(DC) -f $(call get_compose_file) build $$CACHE_FLAG $$SERVICE; \
	else \
		echo "Building all services in $(ENV) environment..."; \
		$(DC) -f $(call get_compose_file) build $$CACHE_FLAG; \
	fi

## Quick start: development environment
dev:
	@make up ENV=dev

## Quick start: production environment
prod:
	@make up ENV=prod

## Create PostgreSQL database backup to services/postgres/db/
backup-db:
	@echo "Creating database backup..."
	@sh ./scripts/backup-db.sh
	@echo "Backup completed. New restore.sql file created in services/postgres/db/"

## Transform frontend to production mode and start all containers
frontend-prod:
	@echo "${GREEN}Transforming frontend service to production...${NC}"
	@# Remove volumes and change target to production for frontend service only
	@python3 scripts/transform_compose_frontend.py
	@echo "${GREEN}✓ Frontend transformation completed!${NC}"
	@echo "${GREEN}Starting containers with frontend in production mode...${NC}"
	@# Use the generated compose file that has frontend in production mode
	@$(DC) -f docker-compose.dev.frontend-prod.yml up -d
	@echo "${GREEN}View the frontend at http://localhost${NC}"

# =============================================================================
# Special Targets
# =============================================================================

# This special target allows passing service names as arguments to other targets
# Example: make logs frontend -> SERVICE=$(word 2,$(MAKECMDGOALS)) will be "frontend"
%:
	@:
