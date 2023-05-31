build:
	docker build -t dormammun/gravity-hub:latest ./application

push:
	docker push dormammun/gravity-hub:latest

run:
	docker run --name gravity-hub --rm -p 127.0.0.1:3000:3000/tcp -it dormammun/gravity-hub:latest
