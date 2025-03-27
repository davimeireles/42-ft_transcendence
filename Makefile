# Build and run the Docker containers
all: up

quick: down up

# Build and run the Docker containers
up:
	docker compose up --build

# Stop and remove the Docker containers
down:
	docker compose down

# Stop and remove the Docker containers, volumes, and networks
clean:
	docker compose down -v --rmi all --remove-orphans

nclean:
	docker rm $$(docker ps -a -q)
	docker rmi 42-ft_transcendence-frontend 42-ft_transcendence-backend
	docker volume rm 42-ft_transcendence_db-postgres 42-ft_transcendence_prometheus-data
	docker network rm 42-ft_transcendence_default app_network

# Remove all Docker images
clean-images:
	docker rmi $$(docker images -q)

# Remove all Docker containers
clean-containers:
	docker rm $$(docker ps -a -q)

# Remove all Docker volumes
clean-volumes:
	docker volume rm $$(docker volume ls -q)

# Remove all Docker networks
clean-networks:
	docker network rm $$(docker network ls -q)

restart: clean up

re: nclean up

.PHONY: all up down clean clean-images clean-containers clean-volumes clean-networks restart
