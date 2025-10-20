# Docker Compose files
DC=docker compose
COMPOSE_FILE=docker-compose.yml
COMPOSE_DEV_FILE=docker-compose.dev.yml

# Default environment
ENV=dev

# Optional follow flag for logs
FOLLOW?=

# Colors for pretty output
GREEN=\033[0;32m
NC=\033[0m # No Color

# Function to get the appropriate compose file based on ENV
define get_compose_file
$(if $(filter dev,$(ENV)),$(COMPOSE_DEV_FILE),$(COMPOSE_FILE))
endef

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
		rm -f docker-compose.generated.yml; \
		echo "${GREEN}✓ Cleaned up docker-compose.generated.yml${NC}"; \
	else \
		echo "Skipped replacing docker-compose.yml. Generated file saved as docker-compose.generated.yml"; \
	fi

## Start the containers
up:
	@echo "Starting $(ENV) environment..."; \
	$(DC) -f $(call get_compose_file) up -d

## Stop the containers
## Checks which compose file is being used and stops the containers accordingly.
down:
	@CONTAINER=$$(docker ps -a --format "{{.Names}}" | grep -E "^(storedog-|lab-)" | head -1); \
	if [ -n "$$CONTAINER" ]; then \
		COMPOSE_FILE_USED=$$(docker inspect $$CONTAINER --format '{{index .Config.Labels "com.docker.compose.project.config_files"}}'); \
		echo "Detected compose file ($$COMPOSE_FILE_USED), stopping containers..."; \
		$(DC) -f $$COMPOSE_FILE_USED down; \
	else \
		echo "No containers found, containers may already be stopped."; \
	fi

## Restart the containers
restart:
	@make down ENV=$(ENV)
	@make up ENV=$(ENV)

## Stop containers. Usage: make stop [service_name] [ENV=prod|dev]
stop:
	@SERVICE=$(word 2,$(MAKECMDGOALS)); \
	if [ -n "$$SERVICE" ]; then \
		echo "Stopping service $$SERVICE in $(ENV) environment..."; \
		$(DC) -f $(call get_compose_file) stop $$SERVICE; \
	else \
		echo "Stopping all services in $(ENV) environment..."; \
		$(DC) -f $(call get_compose_file) stop; \
	fi

## Show running containers
ps:
	@$(DC) -f $(call get_compose_file) ps

## View container logs. Usage: make logs [service_name] [FOLLOW=f]
logs:
	@SERVICE=$(word 2,$(MAKECMDGOALS)); \
	if [ -n "$$SERVICE" ]; then \
		echo "Viewing logs for service $$SERVICE in $(ENV) environment..."; \
		$(DC) -f $(call get_compose_file) logs $(if $(FOLLOW),-f) $$SERVICE; \
	else \
		echo "Viewing all logs in $(ENV) environment..."; \
		$(DC) -f $(call get_compose_file) logs $(if $(FOLLOW),-f); \
	fi

## Clean up containers, networks, and volumes
clean:
	@$(DC) -f $(call get_compose_file) down -v --remove-orphans

## Build or rebuild containers. Usage: make build [service_name] [ENV=prod|dev]
build:
	@SERVICE=$(word 2,$(MAKECMDGOALS)); \
	if [ -n "$$SERVICE" ]; then \
		echo "Building service $$SERVICE in $(ENV) environment..."; \
		$(DC) -f $(call get_compose_file) build $$SERVICE; \
	else \
		echo "Building all services in $(ENV) environment..."; \
		$(DC) -f $(call get_compose_file) build; \
	fi

## Switch to development environment and run containers
dev:
	@make up ENV=dev

## Switch to production environment and run containers
prod:
	@make up ENV=prod

## Create a database backup
backup-db:
	@echo "Creating database backup..."
	@sh ./scripts/backup-db.sh
	@echo "Backup completed. New restore.sql file created in services/postgres/db/"

# Special target to allow passing service name as argument
%:
	@:
