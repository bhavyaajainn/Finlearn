# Use official Python image
FROM python:3.11-slim

# Set workdir
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir google-cloud-storage  # Add GCS library


# Copy app code
COPY . .

ENV PERPLEXITY_API_KEY=""
ENV FIREBASE_CREDENTIALS_PATH="/app/service_acount.json"

# Use the PORT environment variable from Cloud Run
CMD exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}