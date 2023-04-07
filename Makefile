ROOT_DIR := $(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))

# Local runs for storedog
local-start:
	if [[ "$(PROFILE)" ]]; then \
		rm -rf ./services/backend/tmp ./services/backend/log; \
		docker-compose --profile "$(PROFILE)" up --force-recreate -d; \
	else \
		rm -rf ./services/backend/tmp ./services/backend/log; \
		docker-compose up --force-recreate -d; \
	fi

local-stop:
	if [[ "$(PROFILE)" ]]; then \
		docker-compose --profile "$(PROFILE)" down; \
	else \
		docker-compose down; \
	fi
	