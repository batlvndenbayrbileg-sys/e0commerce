// NARAN load test (NFR-06: ~5,000 concurrent users, peak ~500 orders/hour).
// Exercises the real read paths: home, shop, product, and the Medusa store API
// (browse + typo-tolerant search). Run against STAGING, never production without
// a heads-up.
//
//   BASE_URL=https://naran.mn \
//   MEDUSA_URL=https://api.naran.mn \
//   MEDUSA_PK=pk_live_xxx \
//   REGION=reg_xxx \
//   k6 run infra/load/k6-storefront.js
//
// Scale the peak with:  k6 run -e PEAK=5000 infra/load/k6-storefront.js
import http from "k6/http";
import { check, sleep, group } from "k6";
import { Rate } from "k6/metrics";

const BASE = __ENV.BASE_URL || "http://localhost:3000";
const MEDUSA = __ENV.MEDUSA_URL || "http://localhost:9000";
const PK = __ENV.MEDUSA_PK || "";
const REGION = __ENV.REGION || "";
const PEAK = Number(__ENV.PEAK || 500); // ramp target; raise toward 5000 on staging
const LANG = __ENV.LANG || "mn";

const errors = new Rate("errors");

export const options = {
  scenarios: {
    browse: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "1m", target: Math.round(PEAK * 0.3) },
        { duration: "3m", target: PEAK },
        { duration: "2m", target: PEAK },
        { duration: "1m", target: 0 },
      ],
    },
  },
  thresholds: {
    // NFR-01/06 targets: fast p95, <1% errors under load.
    http_req_duration: ["p(95)<800"],
    errors: ["rate<0.01"],
    http_req_failed: ["rate<0.01"],
  },
};

const SEARCH_TERMS = ["serum", "parfum", "glow", "rose", "cream", "serom"]; // incl. a typo

function medusaHeaders() {
  return PK ? { "x-publishable-api-key": PK } : {};
}

export default function () {
  group("storefront pages", () => {
    const home = http.get(`${BASE}/${LANG}`);
    check(home, { "home 200": r => r.status === 200 }) || errors.add(1);

    const shop = http.get(`${BASE}/${LANG}/shop`);
    check(shop, { "shop 200": r => r.status === 200 }) || errors.add(1);
  });

  group("medusa store api", () => {
    const q = `region_id=${REGION}&limit=12&fields=id,title,handle,*variants.calculated_price`;
    const browse = http.get(`${MEDUSA}/store/products?${q}`, { headers: medusaHeaders() });
    check(browse, { "browse 200": r => r.status === 200 }) || errors.add(1);

    // Full-text / typo-tolerant search (MeiliSearch plugin endpoint).
    const term = SEARCH_TERMS[Math.floor(Math.random() * SEARCH_TERMS.length)];
    const search = http.get(`${MEDUSA}/store/meilisearch/products?query=${term}&region_id=${REGION}&limit=12`, { headers: medusaHeaders() });
    check(search, { "search 200": r => r.status === 200 }) || errors.add(1);

    // Deep-link a product from the browse result (if any).
    try {
      const first = browse.json("products")[0];
      if (first && first.handle) {
        const pdp = http.get(`${BASE}/${LANG}/product/${first.handle}`);
        check(pdp, { "pdp 200": r => r.status === 200 }) || errors.add(1);
      }
    } catch (_) { /* ignore parse errors under load */ }
  });

  sleep(Math.random() * 2 + 1); // 1–3s think time
}
