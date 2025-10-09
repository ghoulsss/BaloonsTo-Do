FROM python:3.12-alpine

# RUN apt update && \
#     apt install -y --no-install-recommends curl build-essential && \
#     rm -rf /var/lib/apt/lists/*

WORKDIR /code

# Install Poetry
RUN pip install poetry

ENV PATH="/root/.local/bin:$PATH"
ENV POETRY_NO_INTERACTION=1
ENV POETRY_VIRTUALENVS_CREATE=false

# Add Poetry to PATHs
ENV PATH="/root/.local/bin:${PATH}"

# Copy Poetry configuration files
COPY poetry.lock pyproject.toml ./

# Install dependencies (runtime only)
RUN poetry install --no-root

# Copy the entire project
COPY . .

# Expose the port that the application will run on
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "main:app", "--workers", "4","--bind", "0.0.0.0:8000"]
