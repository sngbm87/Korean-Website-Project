FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

COPY requirements-production.txt .
RUN pip install --no-cache-dir -r requirements-production.txt \
    && pip cache purge

# Copy ONLY essential production files (minimal package)
COPY backend/app.py ./backend/
COPY static/css/style.css ./static/css/
COPY static/js/main.js ./static/js/
COPY templates/index.html ./templates/

EXPOSE 8080

ENV FLASK_APP=backend/app.py
ENV FLASK_ENV=production
ENV PORT=8080
ENV PYTHONPATH=/app
ENV DB_HOST=postgres
ENV DB_NAME=bts_website
ENV DB_USER=bts_user
ENV DB_PASSWORD=bts_secure_kr_website_2025_prod_deployment_db
ENV DB_PORT=5432
ENV SECRET_KEY=bts_kr_website_enterprise_secure_secret_key_2025_production

RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

CMD ["python", "backend/app.py"]
