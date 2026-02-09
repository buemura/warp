.PHONY: install dev test migrate migrate-create migrate-down migrate-reset

install:
	pip install -e ".[dev]"

dev:
	uvicorn app.main:app --reload

test:
	pytest -v

migrate:
	alembic upgrade head

migrate-create:
	@read -p "Migration message: " msg; \
	alembic revision --autogenerate -m "$$msg"

migrate-down:
	alembic downgrade -1

migrate-reset:
	alembic downgrade base
