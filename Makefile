.PHONY: build dev run build-app-main build-wc-example

build: build-app-main build-wc-example

build-app-main:
	cd frontend/applications/main && npm install && npm run build -- --outDir ../../../static/app/main --emptyOutDir

build-wc-example:
	cd frontend/web-components/example && npm install && npm run build -- --outDir ../../../static/wc/example --emptyOutDir

dev:
	cd frontend/applications/main && npm run dev

run: build
	./wippy run -c
