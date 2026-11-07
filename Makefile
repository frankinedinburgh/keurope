.PHONY: backend-dev backend-build backend-test \
	express-dev express-build express-start express-test express-lint express-seed \
	java-dev java-build java-test \
	frontend-dev frontend-build frontend-preview frontend-storybook \
	clean

## Go backend (backend/)
backend-dev: ## Run the Go backend
	cd backend && go run .

backend-build: ## Build the Go backend binary
	cd backend && go build -o bin/keurope .

backend-test: ## Run Go backend tests
	cd backend && go test ./...

## Express/TS backend (backend_express/)
express-dev: ## Run the Express backend with hot reload
	cd backend_express && npm run dev

express-build: ## Compile the Express backend
	cd backend_express && npm run build

express-start: ## Run the compiled Express backend
	cd backend_express && npm run start

express-test: ## Run Express backend tests
	cd backend_express && npm run test

express-lint: ## Lint the Express backend
	cd backend_express && npm run lint

express-seed: ## Seed the Express backend database
	cd backend_express && npm run seed

## Java/Spring backend (backend_java/)
java-dev: ## Run the Java backend
	cd backend_java && ./mvnw spring-boot:run

java-build: ## Build the Java backend
	cd backend_java && ./mvnw package

java-test: ## Run Java backend tests
	cd backend_java && ./mvnw test

## Frontend (frontend/)
frontend-dev: ## Run the frontend dev server
	cd frontend && npm run dev

frontend-build: ## Build the frontend
	cd frontend && npm run build

frontend-preview: ## Preview the built frontend
	cd frontend && npm run preview

frontend-storybook: ## Run Storybook
	cd frontend && npm run storybook

clean: ## Remove build artifacts across all sub-projects
	rm -rf frontend/dist backend/bin backend_express/dist backend_java/target
