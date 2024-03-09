COMPOSE_FILE=docker-compose.yaml
IMAGE_NAME=rubiks-cube-solver
CONTAINER_NAME=$(IMAGE_NAME)-container

all: build up

build:
	docker build -t $(IMAGE_NAME) .

run: build
	docker run --name $(CONTAINER_NAME) -d $(IMAGE_NAME)

up:
	docker compose -f $(COMPOSE_FILE) up -d

down:
	docker compose -f $(COMPOSE_FILE) down

clean-image:
	docker rmi $(IMAGE_NAME)

clean: clean-image
	docker system prune -a

rebuild: clean build run

.PHONY: all build run up down clean-image clean-container clean rebuild