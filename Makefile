# =============================================================================
# Storedog Application Makefile
# =============================================================================
# This Makefile provides convenient commands for managing the Storedog app
# using Docker Compose. 
#
# run `make help` to see all available commands. 
#
# Note: All commands use the ENV variable to determine which docker-compose.yml
# file to use. Set your preferred environment below before running commands.
# =============================================================================

# Environment settings: prod, dev, dev-frontend-prod
ENV=prod

DC=docker compose
COMPOSE_FILE=docker-compose.yml              # Production compose file
COMPOSE_DEV_FILE=docker-compose.dev.yml      # Development compose file
COMPOSE_FRONTEND_PROD_FILE=docker-compose.dev.frontend-prod.yml # Frontend production compose file

# Terminal Colors for Better UX
GREEN=\033[0;32m
HOT_PINK=\033[0;95m
NC=\033[0m # No Color

# Helper function to select the appropriate compose file based on environment
define get_compose_file
$(if $(filter dev,$(ENV)),$(COMPOSE_DEV_FILE),$(if $(filter dev-frontend-prod,$(ENV)),$(COMPOSE_FRONTEND_PROD_FILE),$(COMPOSE_FILE)))
endef

.PHONY: help prepare-release up down restart stop ps logs clean build dd-dev dd-prod backup-db prepare-frontend-prod

help: ## Show this comprehensive help menu
	@echo "${GREEN}===============================================================================${NC}"
	@echo "${GREEN}                        Storedog Application Commands${NC}"
	@echo "${GREEN}===============================================================================${NC}"

	@awk '/^[a-zA-Z\-\_0-9]+:/ { \
		if (match(lastLine, /^## Usage: (.*)/)) { \
			usageText = substr(lastLine, RSTART + 10, RLENGTH - 10); \
		} \
		if (match(secondLastLine, /^## (.*)/)) { \
			descText = substr(secondLastLine, RSTART + 3, RLENGTH - 3); \
		} \
		if (usageText && descText) { \
			printf "  ${HOT_PINK}%-32s${NC} %s\n", usageText, descText; \
			usageText = ""; descText = ""; \
		} \
	} \
	{ secondLastLine = lastLine; lastLine = $$0 }' $(MAKEFILE_LIST)
	@echo ""
	@echo "${GREEN}===============================================================================${NC}"

# =============================================================================
# 🚀 Container Operations
# =============================================================================

## Start containers in specified environment
## Usage: make up [clean]
up:
	@COMPOSE_FILE_PATH=$(call get_compose_file); \
	echo "${GREEN}Using compose file: ${HOT_PINK}$$COMPOSE_FILE_PATH${NC}"; \
	if echo "$(MAKECMDGOALS)" | grep -q "clean"; then \
		echo "Building and starting ${HOT_PINK}$(ENV)${NC} environment without cache..."; \
		$(DC) -f $$COMPOSE_FILE_PATH build --no-cache; \
	else \
		echo "Starting ${HOT_PINK}$(ENV)${NC} environment..."; \
	fi; \
	$(DC) -f $$COMPOSE_FILE_PATH up -d
	@echo "${GREEN}View the frontend at http://localhost${NC}"

## Stop all containers for this project
## Usage: make down
down:
	@echo "Stopping all Storedog containers..."
	@$(DC) down

## Restart containers using current ENV setting
## Usage: make restart
restart:
	@COMPOSE_FILE_PATH=$(call get_compose_file); \
	echo "${GREEN}Restarting containers using: ${HOT_PINK}$$COMPOSE_FILE_PATH${NC}"; \
	$(DC) -f $$COMPOSE_FILE_PATH down; \
	$(DC) -f $$COMPOSE_FILE_PATH up -d
	@echo "${GREEN}View the frontend at http://localhost${NC}"

## Show running containers for current environment
## Usage: make ps
ps:
	@echo "${GREEN}Current ENV: ${HOT_PINK}$(ENV)${NC}"
	@$(DC) ps

# =============================================================================
# 🔧 Build & Development
# =============================================================================

## Build containers
## Usage: make build [service] [clean]
build:
	@COMPOSE_FILE_PATH=$(call get_compose_file); \
	echo "${GREEN}Using compose file: ${HOT_PINK}$$COMPOSE_FILE_PATH${NC}"; \
	SERVICE=$(filter-out build clean,$(MAKECMDGOALS)); \
	CACHE_FLAG="$$(if [ -n "$(filter clean,$(MAKECMDGOALS))" ]; then echo --no-cache; fi)"; \
	if [ -n "$$SERVICE" ]; then \
		echo "Building service ${HOT_PINK}$$SERVICE${NC} in ${HOT_PINK}$(ENV)${NC} environment..."; \
		$(DC) -f $$COMPOSE_FILE_PATH build $$CACHE_FLAG $$SERVICE; \
	else \
		echo "Building all services in ${HOT_PINK}$(ENV)${NC} environment..."; \
		$(DC) -f $$COMPOSE_FILE_PATH build $$CACHE_FLAG; \
	fi

## Stop specific service or all services
## Usage: make stop [service]
stop:
	@echo "${GREEN}Current ENV: ${HOT_PINK}$(ENV)${NC}"
	@SERVICE=$(word 2,$(MAKECMDGOALS)); \
	if [ -n "$$SERVICE" ]; then \
		echo "Stopping service ${HOT_PINK}$$SERVICE${NC}..."; \
		$(DC) stop $$SERVICE; \
	else \
		echo "Stopping all services..."; \
		$(DC) stop; \
	fi

## View container logs
## Usage: make logs [service] [follow]
logs:
	@echo "${GREEN}Current ENV: ${HOT_PINK}$(ENV)${NC}"
	@SERVICE=$(filter-out logs follow,$(MAKECMDGOALS)); \
	if echo "$(MAKECMDGOALS)" | grep -q "follow"; then \
		FOLLOW_FLAG="-f"; \
	else \
		FOLLOW_FLAG=""; \
	fi; \
	if [ -n "$$SERVICE" ]; then \
		echo "Viewing logs for service ${HOT_PINK}$$SERVICE${NC}..."; \
		$(DC) logs $$FOLLOW_FLAG $$SERVICE; \
	else \
		echo "Viewing all logs..."; \
		$(DC) logs $$FOLLOW_FLAG; \
	fi

## Clean up containers, networks, and volumes (destructive)
## Usage: make clean
clean:
	@COMPOSE_FILE_PATH=$(call get_compose_file); \
	$(DC) -f $$COMPOSE_FILE_PATH down -v --remove-orphans

# =============================================================================
# ⚙️ Special Operations
# =============================================================================

## Generate production compose file for release
## Usage: make prepare-release
prepare-release:
	@echo "${GREEN}Transforming ${HOT_PINK}docker-compose.dev.yml${GREEN} to ${HOT_PINK}docker-compose.generated.yml${GREEN}...${NC}"
	@python3 scripts/transform_compose.py docker-compose.dev.yml docker-compose.generated.yml
	@echo "${GREEN}✓ Production compose file generated successfully!${NC}"
	@echo ""
	@echo "📄 Generated file: ${HOT_PINK}docker-compose.generated.yml${NC}"
	@echo "Please review the generated file in another terminal or editor before proceeding."
	@echo ""
	@read -p "Have you reviewed the file? Replace docker-compose.yml? [y/N]: " confirm; \
	if [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ]; then \
		cp docker-compose.generated.yml docker-compose.yml; \
		echo "${GREEN}✓ ${HOT_PINK}docker-compose.yml${GREEN} has been updated!${NC}"; \
		rm -f docker-compose.generated.yml; \
		echo "${GREEN}✓ Cleaned up ${HOT_PINK}docker-compose.generated.yml${NC}"; \
	else \
		echo "Skipped replacing ${HOT_PINK}docker-compose.yml${NC}. Generated file saved as ${HOT_PINK}docker-compose.generated.yml${NC}"; \
	fi

## Create PostgreSQL database backup
## Usage: make backup-db
backup-db:
	@echo "Creating database backup..."
	@sh ./scripts/backup-db.sh
	@echo "Backup completed. New restore.sql file created in services/postgres/db/"

## Generate a dev compose with prod frontend target
## Usage: make frontend-prod
frontend-prod:
	@echo "${GREEN}Transforming frontend service to production...${NC}"
	@# Remove volumes and change target to production for frontend service only
	@python3 scripts/transform_compose_frontend.py
	@echo "${GREEN}✓ Frontend transformation completed!${NC}"
	@echo "${GREEN}Generated: ${HOT_PINK}docker-compose.dev.frontend-prod.yml${NC}"
	@echo ""
	@echo "${GREEN}Next steps:${NC}"
	@echo "1. Update the ENV at the top of the Makefile to ${HOT_PINK}dev-frontend-prod${NC}"
	@echo "2. Run ${HOT_PINK}make up${NC} to start containers with this configuration"

# =============================================================================
# Special Targets
# =============================================================================

# This special target allows passing service names as arguments to other targets
# Example: make logs frontend -> SERVICE=$(word 2,$(MAKECMDGOALS)) will be "frontend"
%:
	@:
