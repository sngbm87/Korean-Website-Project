FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

COPY requirements-production.txt .
RUN pip install --no-cache-dir -r requirements-production.txt \
    && pip cache purge

COPY backend/app.py ./backend/
COPY static/css/ ./static/css/
COPY static/js/main.js ./static/js/
COPY static/images/ ./static/images/
COPY templates/ ./templates/

EXPOSE 8080

ENV FLASK_APP=backend/app.py
ENV FLASK_ENV=production
ENV PORT=8080
ENV PYTHONPATH=/app

RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

CMD ["python", "backend/app.py"]
