#!/bin/sh
# Parse DATABASE_URL into individual Laravel DB_* variables
if [ -n "$DATABASE_URL" ]; then
    export DB_CONNECTION=pgsql
    export DB_HOST=$(echo "$DATABASE_URL" | sed -e 's|^.*@||' -e 's|/.*$||' -e 's|:.*$||')
    export DB_PORT=$(echo "$DATABASE_URL" | sed -e 's|^.*@||' -e 's|.*/||' -e 's|^.*:||' | grep -E '^[0-9]+$' || echo "5432")
    export DB_DATABASE=$(echo "$DATABASE_URL" | sed -e 's|^.*/||' -e 's|?.*$||')
    export DB_USERNAME=$(echo "$DATABASE_URL" | sed -e 's|^.*://||' -e 's|:.*$||')
    export DB_PASSWORD=$(echo "$DATABASE_URL" | sed -e 's|^[^:]*://[^:]*:||' -e 's|@.*$||')
fi

php artisan config:cache
php artisan route:cache
php artisan migrate --force
php artisan serve --host=0.0.0.0 --port=10000
