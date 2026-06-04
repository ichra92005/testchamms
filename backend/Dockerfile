FROM php:8.3-cli

RUN apt-get update && apt-get install -y \
    git curl unzip libpq-dev libonig-dev libxml2-dev \
    && docker-php-ext-install pdo pdo_pgsql pdo_mysql mbstring xml \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app
COPY . .

RUN composer install --no-dev --optimize-autoloader --no-interaction

RUN chmod -R 775 storage bootstrap/cache

EXPOSE 10000

COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

CMD ["/bin/sh", "/app/start.sh"]
