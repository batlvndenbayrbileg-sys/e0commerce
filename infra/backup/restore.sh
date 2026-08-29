#!/usr/bin/env bash
# NARAN Postgres restore (NFR-05: RTO ≤ 2h; test restores quarterly).
# Restores a gzipped pg_dump into the compose Postgres container.
#   ./restore.sh /opt/naran/backups/naran-20260829-120000.sql.gz
#
# ⚠️ Overwrites the target database. Test on a STAGING db first.
set -euo pipefail

FILE="${1:?usage: restore.sh <backup.sql.gz>}"
PG_CONTAINER="${PG_CONTAINER:-naran-postgres-1}"
POSTGRES_USER="${POSTGRES_USER:-naran}"
POSTGRES_DB="${POSTGRES_DB:-naran}"

[ -f "$FILE" ] || { echo "not found: $FILE"; exit 1; }
gzip -t "$FILE"

echo "Restoring $FILE → $POSTGRES_DB on $PG_CONTAINER"
read -r -p "This OVERWRITES $POSTGRES_DB. Type 'yes' to continue: " ok
[ "$ok" = "yes" ] || { echo "aborted"; exit 1; }

# Recreate the schema cleanly, then load the dump.
gunzip -c "$FILE" | docker exec -i "$PG_CONTAINER" psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1
echo "[$(date -Is)] restore complete. Restart medusa so it reconnects."
