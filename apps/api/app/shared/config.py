from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/warp"
    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE: int = 52_428_800  # 50 MB
    FRONTEND_URL: str = "http://localhost:5173"

    model_config = {"env_file": ".env"}


settings = Settings()
