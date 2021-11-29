start:
	docker-compose pull
	docker-compose build --pull
	docker-compose up -d

stop:
	docker-compose down

restart:
	docker-compose restart

git-update:
	if [ "$(shell whoami)" != "base" ]; then sudo -u base git pull; else git pull; fi

update: git-update start

set-header:
	docker exec showroom-frontend npx gulp set-header
	docker exec showroom-frontend npm run build
	make restart
