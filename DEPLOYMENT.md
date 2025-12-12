# Deployment Guide

## Initial Setup (One-time - Production)

1. Create Heroku app:
```bash
heroku create your-app-name
```

2. Add PostgreSQL:
```bash
heroku addons:create heroku-postgresql:essential-0
```

3. Set environment variables:
```bash
heroku config:set \
  JWT_SECRET="your-secret-key" \
  FRONTEND_URL="https://your-frontend.com" \
  CLOUDINARY_CLOUD_NAME="name" \
  CLOUDINARY_API_KEY="key" \
  CLOUDINARY_API_SECRET="secret" \
  SMTP_HOST="smtp.brevo.com" \
  SMTP_PORT="587" \
  SMTP_USER="your-email" \
  SMTP_PASS="your-password" \
  FROM_EMAIL="noreply@yourapp.com"
```

4. Deploy:
```bash
git push heroku main
```

## Regular Deployments

Just push to Heroku:
```bash
git push heroku main
```

Migrations run automatically via the `release` phase in Procfile.

## Troubleshooting

View logs:
```bash
heroku logs --tail
```

Manually run migrations (if needed):
```bash
heroku run npx prisma migrate deploy
```