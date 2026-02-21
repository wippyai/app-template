.PHONY: build dev run

build:
	cd frontend && npm install && npm run build

dev:
	cd frontend && npm run dev

run: build
	wippy run -c
