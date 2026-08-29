#!/usr/bin/env bash
# NARAN Postgres backup (NFR-05: automatic backups, RPO ≤ 15 min).
# Dumps the Postgres DB from the compose stack, gzips it, and prunes old copies.
# Run from cron on the VPS, e.g. every 15 minutes:
#   */15 * * * * /opt/naran/infra/backup/backup.sh >> /var/log/naran-backup.log 2>&1
#
# Env (override as needed):
#   PG_CONTAINER   docker container name/id of postgres (default: naran-postgres-1)
#   POSTGRES_USER  db user     (default: naran)
#   POSTGRES_DB    db name     (default: naran)
#   BACKUP_DIR     output dir  (default: /opt/naran/backups)
#   RETENTION_DAYS keep window (default: 14)
#   S3_BUCKET/S3_ENDPOINT  if set, also upload via `aws s3 cp` (R2-compatible)
set -euo pipefail

PG_CONTAINER="${PG_CONTAINER:-naran-postgres-1}"
POSTGRES_USER="${POSTGRES_USER:-naran}"
POSTGRES_DB="${POSTGRES_DB:-naran}"
BACKUP_DIR="${BACKUP_DIR:-/opt/naran/backups}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"

mkdir -p "$BACKUP_DIR"
STAMP="$(date +%Y%m%d-%H%M%S)"
OUT="$BACKUP_DIR/naran-$STAMP.sql.gz"

echo "[$(date -Is)] dumping $POSTGRES_DB from $PG_CONTAINER → $OUT"
docker exec "$PG_CONTAINER" pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" | gzip -9 > "$OUT"

# Integrity: gzip must be valid and non-trivial in size.
gzip -t "$OUT"
SIZE=$(stat -c%s "$OUT" 2>/dev/null || stat -f%z "$OUT")
if [ "$SIZE" -lt 1000 ]; then echo "backup suspiciously small ($SIZE bytes)"; exit 1; fi
echo "[$(date -Is)] ok ($SIZE bytes)"

# Optional off-site copy to R2/S3.
if [ -n "${S3_BUCKET:-}" ] && command -v aws >/dev/null 2>&1; then
  aws s3 cp "$OUT" "s3://$S3_BUCKET/db-backups/$(basename "$OUT")" ${S3_ENDPOINT:+--endpoint-url "$S3_ENDPOINT"}
  echo "[$(date -Is)] uploaded to s3://$S3_BUCKET/db-backups/"
fi

# Prune local backups older than the retention window.
find "$BACKUP_DIR" -name "naran-*.sql.gz" -type f -mtime +"$RETENTION_DAYS" -delete
echo "[$(date -Is)] pruned backups older than ${RETENTION_DAYS}d"
