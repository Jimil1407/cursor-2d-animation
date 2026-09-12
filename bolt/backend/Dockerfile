FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

RUN apt-get update -qq \
    && apt-get install --no-install-recommends -y \
        build-essential \
        gcc \
        cmake \
        libcairo2-dev \
        libffi-dev \
        libpango1.0-dev \
        freeglut3-dev \
        ffmpeg \
        pkg-config \
        make \
        ghostscript \
        fonts-noto \
    && rm -rf /var/lib/apt/lists/*

# Installed before the source is copied so dependency layers stay cached.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Rendered scenes come from an LLM and from user input, so never run them as root.
RUN useradd --create-home --uid 10001 appuser \
    && mkdir -p /app/media /app/Video_codes \
    && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
