import { defineRouteConfig } from "@medusajs/admin-sdk";
import { ChartBar } from "@medusajs/icons";
import { Container, Heading, Text, Button, Table, Badge, toast } from "@medusajs/ui";
import { useEffect, useState } from "react";
import { usePermissions } from "../../lib/perms";
import { AccessDenied } from "../../lib/AccessDenied";

type Overview = {
  orders: number;
  customers: number;
  revenue: number;
  avgOrder: number;
  scanned: number;
  capped: boolean;
  topProducts: { name: string; qty: number; revenue: number }[];
  recent: { id: string; email: string; total: number; date: string }[];
};

async function adminFetch(path: string) {
  const res = await fetch(`/admin${path}`, { credentials: "include", headers: { "content-type": "application/json" } });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}

const tug = (n: number) => `₮${new Intl.NumberFormat("en-US").format(Math.round(n || 0))}`;
const nf = (n: number) => new Intl.NumberFormat("mn-MN").format(n || 0);

// Inline icons (no extra deps, so an icon name can never break the build).
const ico = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const IcoRevenue = () => (<svg {...ico}><circle cx="12" cy="12" r="9" /><path d="M12 7v10M9.5 9.2c0-1 1.1-1.7 2.5-1.7s2.5.7 2.5 1.7-1.1 1.6-2.5 1.6-2.5.7-2.5 1.7 1.1 1.7 2.5 1.7 2.5-.7 2.5-1.7" /></svg>);
const IcoOrders = () => (<svg {...ico}><path d="M6 7h15l-1.5 9H7.5L6 4H3" /><circle cx="9" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" /></svg>);
const IcoAvg = () => (<svg {...ico}><path d="M4 19V5M4 15l4-4 4 3 8-8" /><path d="M20 6v4h-4" /></svg>);
const IcoCustomers = () => (<svg {...ico}><circle cx="9" cy="8" r="3.2" /><path d="M3.5 19a5.5 5.5 0 0 1 11 0M16 6.2a3.2 3.2 0 0 1 0 6M18 13.5a5.5 5.5 0 0 1 3 5" /></svg>);

const TONES: Record<string, string> = {
  green: "bg-ui-tag-green-bg text-ui-tag-green-icon",
  blue: "bg-ui-tag-blue-bg text-ui-tag-blue-icon",
  orange: "bg-ui-tag-orange-bg text-ui-tag-orange-icon",
  purple: "bg-ui-tag-purple-bg text-ui-tag-purple-icon",
};

const AnalyticsPage = () => {
  const { loading: permLoading, can } = usePermissions();
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setData(await adminFetch("/analytics/overview"));
    } catch (e: any) {
      toast.error(e.message || "Аналитик ачаалж чадсангүй");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  if (!permLoading && !can("analytics.read")) {
    return <AccessDenied title="Аналитик" perm="analytics.read" />;
  }

  const maxRev = Math.max(1, ...(data?.topProducts || []).map(p => p.revenue));

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h1">Аналитик</Heading>
          <Text className="text-ui-fg-subtle" size="small">Борлуулалтын тойм, тэргүүлэх бараа, сүүлийн захиалга.</Text>
        </div>
        <Button variant="secondary" size="small" onClick={load} disabled={loading} isLoading={loading}>Сэргээх</Button>
      </div>

      {/* KPI cards */}
      <div className="px-6 py-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <Stat icon={<IcoRevenue />} tone="green" label="Нийт орлого" value={data ? tug(data.revenue) : ""} loading={loading} />
          <Stat icon={<IcoOrders />} tone="blue" label="Захиалга" value={data ? nf(data.orders) : ""} loading={loading} />
          <Stat icon={<IcoAvg />} tone="orange" label="Дундаж захиалга" value={data ? tug(data.avgOrder) : ""} loading={loading} />
          <Stat icon={<IcoCustomers />} tone="purple" label="Харилцагч" value={data ? nf(data.customers) : ""} loading={loading} />
        </div>
        {data?.capped && (
          <Text className="text-ui-fg-muted mt-3 block" size="xsmall">
            Орлого/тэргүүлэх бараа нь сүүлийн {nf(data.scanned)} захиалгаас тооцоолсон.
          </Text>
        )}
      </div>

      {/* Top products */}
      <div className="px-6 py-5">
        <Text weight="plus" size="small" className="mb-3">Тэргүүлэх бараа (орлогоор)</Text>
        <div className="rounded-lg border border-ui-border-base overflow-hidden">
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Бараа</Table.HeaderCell>
                <Table.HeaderCell className="text-right">Тоо</Table.HeaderCell>
                <Table.HeaderCell className="text-right">Орлого</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {loading && (data?.topProducts || []).length === 0 && (
                [0, 1, 2].map(i => (
                  <Table.Row key={i}>
                    <Table.Cell><div className="h-4 w-40 rounded bg-ui-bg-component animate-pulse" /></Table.Cell>
                    <Table.Cell><div className="h-4 w-10 ml-auto rounded bg-ui-bg-component animate-pulse" /></Table.Cell>
                    <Table.Cell><div className="h-4 w-20 ml-auto rounded bg-ui-bg-component animate-pulse" /></Table.Cell>
                  </Table.Row>
                ))
              )}
              {!loading && (data?.topProducts || []).length === 0 && (
                <Table.Row><Table.Cell><Text className="text-ui-fg-subtle py-3" size="small">Захиалга алга.</Text></Table.Cell></Table.Row>
              )}
              {(data?.topProducts || []).map((p, i) => (
                <Table.Row key={p.name + i}>
                  <Table.Cell>
                    <div className="flex items-center gap-3">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ui-bg-component text-ui-fg-subtle txt-compact-xsmall-plus tabular-nums">{i + 1}</span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate">{p.name}</div>
                        <div className="mt-1.5 h-1.5 w-full max-w-[180px] overflow-hidden rounded-full bg-ui-bg-component">
                          <div className="h-full rounded-full bg-ui-tag-orange-icon" style={{ width: `${Math.max(4, Math.round((p.revenue / maxRev) * 100))}%` }} />
                        </div>
                      </div>
                    </div>
                  </Table.Cell>
                  <Table.Cell className="text-right tabular-nums">{nf(p.qty)}</Table.Cell>
                  <Table.Cell className="text-right font-medium tabular-nums">{tug(p.revenue)}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      </div>

      {/* Recent orders */}
      <div className="px-6 py-5">
        <Text weight="plus" size="small" className="mb-3">Сүүлийн захиалга</Text>
        <div className="rounded-lg border border-ui-border-base overflow-hidden">
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Захиалга</Table.HeaderCell>
                <Table.HeaderCell>Имэйл</Table.HeaderCell>
                <Table.HeaderCell>Огноо</Table.HeaderCell>
                <Table.HeaderCell className="text-right">Дүн</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {loading && (data?.recent || []).length === 0 && (
                [0, 1, 2].map(i => (
                  <Table.Row key={i}>
                    <Table.Cell><div className="h-4 w-16 rounded bg-ui-bg-component animate-pulse" /></Table.Cell>
                    <Table.Cell><div className="h-4 w-36 rounded bg-ui-bg-component animate-pulse" /></Table.Cell>
                    <Table.Cell><div className="h-4 w-20 rounded bg-ui-bg-component animate-pulse" /></Table.Cell>
                    <Table.Cell><div className="h-4 w-16 ml-auto rounded bg-ui-bg-component animate-pulse" /></Table.Cell>
                  </Table.Row>
                ))
              )}
              {!loading && (data?.recent || []).length === 0 && (
                <Table.Row><Table.Cell><Text className="text-ui-fg-subtle py-3" size="small">Захиалга алга.</Text></Table.Cell></Table.Row>
              )}
              {(data?.recent || []).map(o => (
                <Table.Row key={o.id}>
                  <Table.Cell><Badge size="2xsmall">{o.id}</Badge></Table.Cell>
                  <Table.Cell className="text-ui-fg-subtle">{o.email}</Table.Cell>
                  <Table.Cell>{o.date?.slice(0, 10)}</Table.Cell>
                  <Table.Cell className="text-right font-medium tabular-nums">{tug(o.total)}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      </div>
    </Container>
  );
};

function Stat({ icon, tone, label, value, loading }: { icon: React.ReactNode; tone: string; label: string; value: string; loading: boolean }) {
  return (
    <div className="rounded-lg border border-ui-border-base bg-ui-bg-subtle p-4 transition-shadow hover:shadow-elevation-card-rest">
      <div className="flex items-center justify-between gap-2">
        <Text className="text-ui-fg-subtle" size="small">{label}</Text>
        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${TONES[tone] || TONES.blue}`}>{icon}</span>
      </div>
      {loading
        ? <div className="mt-2 h-8 w-28 rounded bg-ui-bg-component animate-pulse" />
        : <Heading level="h2" className="mt-2 tabular-nums">{value}</Heading>}
    </div>
  );
}

export const config = defineRouteConfig({
  label: "Аналитик",
  icon: ChartBar,
});

export default AnalyticsPage;
