.PHONY: build dev run lint build-app-main build-wc-reaction-bar build-wc-websocket-log build-wc-chart-circle build-wc-mermaid build-wc-markdown build-wc-model-gallery

build: build-app-main build-wc-reaction-bar build-wc-websocket-log build-wc-chart-circle build-wc-mermaid build-wc-markdown build-wc-model-gallery

build-app-main:
	cd frontend/applications/main && npm install && npm run build -- --outDir ../../../static/app/main --emptyOutDir

build-wc-reaction-bar:
	cd frontend/web-components/reaction-bar && npm install && npm run build -- --outDir ../../../static/wc/reaction-bar --emptyOutDir

build-wc-websocket-log:
	cd frontend/web-components/websocket-log && npm install && npm run build -- --outDir ../../../static/wc/websocket-log --emptyOutDir

build-wc-chart-circle:
	cd frontend/web-components/chart-circle && npm install && npm run build -- --outDir ../../../static/wc/chart-circle --emptyOutDir

build-wc-mermaid:
	cd frontend/web-components/mermaid && npm install && npm run build -- --outDir ../../../static/wc/mermaid --emptyOutDir

build-wc-markdown:
	cd frontend/web-components/markdown && npm install && npm run build -- --outDir ../../../static/wc/markdown --emptyOutDir

build-wc-model-gallery:
	cd frontend/web-components/model-gallery && npm install && npm run build -- --outDir ../../../static/wc/model-gallery --emptyOutDir

lint:
	cd frontend/web-components/reaction-bar && npm run lint
	cd frontend/web-components/websocket-log && npm run lint
	cd frontend/web-components/chart-circle && npm run lint
	cd frontend/web-components/mermaid && npm run lint
	cd frontend/web-components/markdown && npm run lint
	cd frontend/web-components/model-gallery && npm run lint

dev:
	cd frontend/applications/main && npm run dev

run: build
	wippy run -c
