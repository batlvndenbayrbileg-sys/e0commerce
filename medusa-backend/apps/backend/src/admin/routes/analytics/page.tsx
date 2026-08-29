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

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h1">Аналитик</Heading>
          <Text className="text-ui-fg-subtle" size="small">Борлуулалтын тойм, тэргүүлэх бараа, сүүлийн захиалга.</Text>
        </div>
        <Button variant="secondary" size="small" onClick={load} disabled={loading}>Сэргээх</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-ui-border-base">
        <Stat label="Нийт орлого" value={data ? tug(data.revenue) : "…"} />
        <Stat label="Захиалга" value={data ? nf(data.orders) : "…"} />
        <Stat label="Дундаж захиалга" value={data ? tug(data.avgOrder) : "…"} />
        <Stat label="Харилцагч" value={data ? nf(data.customers) : "…"} />
      </div>
      {data?.capped && (
        <div className="px-6 py-2">
          <Text className="text-ui-fg-subtle" size="xsmall">
            Орлого/тэргүүлэх бараа нь сүүлийн {nf(data.scanned)} захиалгаас тооцоолсон.
          </Text>
        </div>
      )}

      <div className="px-6 py-4">
        <Text weight="plus" size="small" className="mb-2">Тэргүүлэх бараа (орлогоор)</Text>
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Бараа</Table.HeaderCell>
              <Table.HeaderCell className="text-right">Тоо</Table.HeaderCell>
              <Table.HeaderCell className="text-right">Орлого</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {(data?.topProducts || []).length === 0 && !loading && (
              <Table.Row><Table.Cell><Text className="text-ui-fg-subtle py-3" size="small">Захиалга алга.</Text></Table.Cell></Table.Row>
            )}
            {(data?.topProducts || []).map((p, i) => (
              <Table.Row key={p.name + i}>
                <Table.Cell>{p.name}</Table.Cell>
                <Table.Cell className="text-right">{nf(p.qty)}</Table.Cell>
                <Table.Cell className="text-right font-medium">{tug(p.revenue)}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>

      <div className="px-6 py-4">
        <Text weight="plus" size="small" className="mb-2">Сүүлийн захиалга</Text>
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
            {(data?.recent || []).map(o => (
              <Table.Row key={o.id}>
                <Table.Cell><Badge size="2xsmall">{o.id}</Badge></Table.Cell>
                <Table.Cell className="text-ui-fg-subtle">{o.email}</Table.Cell>
                <Table.Cell>{o.date?.slice(0, 10)}</Table.Cell>
                <Table.Cell className="text-right font-medium">{tug(o.total)}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    </Container>
  );
};

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-ui-bg-base px-6 py-5">
      <Text className="text-ui-fg-subtle" size="small">{label}</Text>
      <Heading level="h2" className="mt-1">{value}</Heading>
    </div>
  );
}

export const config = defineRouteConfig({
  label: "Аналитик",
  icon: ChartBar,
});

export default AnalyticsPage;
