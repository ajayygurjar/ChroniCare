#!/bin/sh
# Runs once, the first time the Postgres container starts on an empty data volume.
# (To re-run it: docker compose -f infra/docker-compose.yml down -v)
#
# One database and one login role per service, so no service can read another's tables
# (architecture plan, section 4):
#   core_db / core_db_test  owned by core_api   (Node core API; _test is for automated tests)
#   payments_db             owned by payments   (Java payment service, added in a later phase)
set -eu

create_service_db() {
  db="$1"; role="$2"; password="$3"; role_options="$4"
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres \
       -v db="$db" -v role="$role" -v pw="$password" -v opts="$role_options" <<'SQL'
CREATE ROLE :"role" LOGIN PASSWORD :'pw' :opts;
CREATE DATABASE :"db" OWNER :"role";
REVOKE ALL ON DATABASE :"db" FROM PUBLIC;
SQL
}

# CREATEDB lets Prisma create its temporary "shadow database" for `prisma migrate dev`.
# That is a local-development convenience; production roles should not have it.
create_service_db core_db     core_api "$CORE_DB_PASSWORD"     CREATEDB
create_service_db payments_db payments "$PAYMENTS_DB_PASSWORD" ""

# Second database for the same role: automated tests must never touch development data.
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres <<'SQL'
CREATE DATABASE core_db_test OWNER core_api;
REVOKE ALL ON DATABASE core_db_test FROM PUBLIC;
SQL
