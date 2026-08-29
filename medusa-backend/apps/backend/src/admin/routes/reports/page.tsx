import { defineRouteConfig } from "@medusajs/admin-sdk";
import { ChartBar } from "@medusajs/icons";
import { Container, Heading, Text, Table, Button, Input, Label, Badge, toast } from "@medusajs/ui";
import { useEffect, useState } from "react";
import { usePermissions } from "../../lib/perms";
import { AccessDenied } from "../../lib/AccessDenied";

type Report = {
  from: string | null; to: string | null;
  totals: { revenue: number; orders: number; aov: number; net: number; vat: number };
  daily: { date: string; revenue: number; orders: number }[];
  byCategory: { name: string; revenue: number; qty: number }[];
  byProduct: { name: string; revenue: number; qty: number }[];
  scanned: number; capped: boolean;
};

async function adminFetch(path: string) {
  const res = await fetch(`/admin${path}`, { credentials: "include", headers: { "content-type": "application/json" } });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}

const nf = (n: number) => new Intl.NumberFormat("mn-MN").format(Math.round(n || 0));
const tug = (n: number) => `₮${nf(n)}`;

const ReportsPage = () => {
  const { loading: permLoading, can } = usePermissions();
  const [data, setData] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const qs = () => {
    const p = new URLSearchParams();
    if (from) p.set("from", from);
    if (to) p.set("to", to);
    return p.toString();
  };

  const load = async () => {
    setLoading(true);
    try {
      setData(await adminFetch(`/reports/sales${qs() ? `?${qs()}` : ""}`));
    } catch (e: any) {
      toast.error(e.message || "Тайлан ачаалж чадсангүй");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const exportCsv = (type: string) => {
    const p = new URLSearchParams(qs());
    p.set("type", type);
    window.open(`/admin/reports/sales/export?${p.toString()}`, "_blank");
  };

  if (!permLoading && !can("reports.read")) {
    return <AccessDenied title="Тайлан" perm="reports.read" />;
  }

  const maxDay = Math.max(1, ...(data?.daily || []).map((d) => d.revenue));

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h1">Борлуулалтын тайлан</Heading>
          <Text className="text-ui-fg-subtle" size="small">Хугацаа, ангилал, бараагаар. НӨАТ (10%) задаргаатай.</Text>
        </div>
      </div>

      {/* Date range */}
      <div className="flex flex-wrap items-end gap-3 px-6 py-3">
        <div className="flex flex-col gap-1">
          <Label size="small">Эхлэх</Label>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-[160px]" />
        </div>
        <div className="flex flex-col gap-1">
          <Label size="small">Дуусах</Label>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-[160px]" />
        </div>
        <Button variant="primary" size="small" onClick={load} isLoading={loading}>Тайлагнах</Button>
        {(from || to) && <Button variant="transparent" size="small" onClick={() => { setFrom(""); setTo(""); }}>Цэвэрлэх</Button>}
        {data?.capped && <Text className="text-ui-fg-subtle" size="xsmall">(эхний {nf(data.scanned)} захиалгаар хязгаарласан)</Text>}
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-ui-border-base">
        <Stat label="Нийт борлуулалт" value={data ? tug(data.totals.revenue) : "…"} />
        <Stat label="НӨАТгүй (net)" value={data ? tug(data.totals.net) : "…"} />
        <Stat label="НӨАТ (10%)" value={data ? tug(data.totals.vat) : "…"} />
        <Stat label="Захиалга" value={data ? nf(data.totals.orders) : "…"} />
        <Stat label="Дундаж захиалга" value={data ? tug(data.totals.aov) : "…"} />
      </div>

      {/* Daily trend */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-2">
          <Text weight="plus" size="small">Өдрийн борлуулалт</Text>
          <Button variant="secondary" size="small" onClick={() => exportCsv("daily")}>CSV</Button>
        </div>
        {(data?.daily || []).length === 0 ? (
          <Text className="text-ui-fg-subtle" size="small">Мэдээлэл алга.</Text>
        ) : (
          <div className="flex flex-col gap-1">
            {data!.daily.map((d) => (
              <div key={d.date} className="flex items-center gap-3">
                <span className="text-xs text-ui-fg-subtle w-24 shrink-0">{d.date}</span>
                <div className="flex-1 bg-ui-bg-subtle rounded h-4 overflow-hidden">
                  <div className="h-full bg-ui-fg-interactive" style={{ width: `${(d.revenue / maxDay) * 100}%` }} />
                </div>
                <span className="text-xs font-medium w-24 text-right shrink-0">{tug(d.revenue)}</span>
                <span className="text-xs text-ui-fg-subtle w-10 text-right shrink-0">{nf(d.orders)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* By category */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-2">
          <Text weight="plus" size="small">Ангиллаар</Text>
          <Button variant="secondary" size="small" onClick={() => exportCsv("category")}>CSV</Button>
        </div>
        <Table>
          <Table.Header><Table.Row>
            <Table.HeaderCell>Ангилал</Table.HeaderCell>
            <Table.HeaderCell className="text-right">Тоо</Table.HeaderCell>
            <Table.HeaderCell className="text-right">Борлуулалт</Table.HeaderCell>
          </Table.Row></Table.Header>
          <Table.Body>
            {(data?.byCategory || []).map((c) => (
              <Table.Row key={c.name}>
                <Table.Cell>{c.name}</Table.Cell>
                <Table.Cell className="text-right">{nf(c.qty)}</Table.Cell>
                <Table.Cell className="text-right font-medium">{tug(c.revenue)}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>

      {/* By product */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-2">
          <Text weight="plus" size="small">Бараагаар (топ 50)</Text>
          <Button variant="secondary" size="small" onClick={() => exportCsv("product")}>CSV</Button>
        </div>
        <Table>
          <Table.Header><Table.Row>
            <Table.HeaderCell>Бараа</Table.HeaderCell>
            <Table.HeaderCell className="text-right">Тоо</Table.HeaderCell>
            <Table.HeaderCell className="text-right">Борлуулалт</Table.HeaderCell>
          </Table.Row></Table.Header>
          <Table.Body>
            {(data?.byProduct || []).map((p) => (
              <Table.Row key={p.name}>
                <Table.Cell>{p.name}</Table.Cell>
                <Table.Cell className="text-right">{nf(p.qty)}</Table.Cell>
                <Table.Cell className="text-right font-medium">{tug(p.revenue)}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>

      {/* VAT / e-Barimt */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Text weight="plus" size="small">НӨАТ тайлан</Text>
            <Badge size="2xsmall" color="blue">e-Barimt</Badge>
          </div>
          <Button variant="secondary" size="small" onClick={() => exportCsv("vat")}>CSV</Button>
        </div>
        <Text className="text-ui-fg-subtle" size="xsmall">Үнэ НӨАТ багтсан (Монгол, 10%). Нийт {data ? tug(data.totals.revenue) : "…"} = НӨАТгүй {data ? tug(data.totals.net) : "…"} + НӨАТ {data ? tug(data.totals.vat) : "…"}.</Text>
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
  label: "Тайлан",
  icon: ChartBar,
});

export default ReportsPage;
