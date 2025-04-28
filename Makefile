up:
	docker-compose up --build

down:
	docker-compose down

frontend:
	cd frontend && npm start

backend-shell:
	docker-compose exec backend /bin/sh

meili-shell:
	docker-compose exec meilisearch /bin/sh

prune:
	docker system prune -af
