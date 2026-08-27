import { defineRouteConfig } from "@medusajs/admin-sdk";
import { ArrowUturnLeft } from "@medusajs/icons";
import { Container, Heading, Table, Button, Badge, Text, toast } from "@medusajs/ui";
import { useEffect, useState } from "react";

type ReturnItem = { quantity: number; item_id: string };
type ReturnRow = {
  id: string;
  status: string;
  order_id: string;
  display_id?: number;
  created_at: string;
  items: ReturnItem[];
};

async function adminFetch(path: string, init?: RequestInit) {
  const res = await fetch(`/admin${path}`, {
    credentials: "include",
    headers: { "content-type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as any)?.message || `Request failed (${res.status})`);
  }
  return res.json();
}

const statusColor: Record<string, "orange" | "green" | "grey"> = {
  requested: "orange",
  received: "green",
  canceled: "grey",
};

const ReturnsPage = () => {
  const [rows, setRows] = useState<ReturnRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminFetch(
        "/returns?fields=id,status,order_id,display_id,created_at,items.item_id,items.quantity&limit=100&order=-created_at",
      );
      setRows((data.returns || []) as ReturnRow[]);
    } catch (e: any) {
      toast.error(e.message || "Буцаалтуудыг ачаалж чадсангүй");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const approve = async (id: string) => {
    setBusy(id);
    try {
      await adminFetch(`/returns/${id}/approve`, { method: "POST" });
      toast.success("Буцаалтыг зөвшөөрч, хүлээн авлаа");
      await load();
    } catch (e: any) {
      toast.error(e.message || "Зөвшөөрөх үед алдаа гарлаа");
    } finally {
      setBusy(null);
    }
  };

  const pending = rows.filter(r => r.status === "requested");

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h1">Буцаалтын хүсэлт</Heading>
          <Text className="text-ui-fg-subtle" size="small">
            Хэрэглэгчийн буцаалтын хүсэлтийг зөвшөөрч, хүлээн авна уу.
          </Text>
        </div>
        <Button variant="secondary" size="small" onClick={load} disabled={loading}>
          Сэргээх
        </Button>
      </div>

      <div className="px-6 py-3">
        <Badge color="orange">{pending.length}</Badge>{" "}
        <Text className="text-ui-fg-subtle inline" size="small">хүлээгдэж буй</Text>
      </div>

      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Буцаалт</Table.HeaderCell>
            <Table.HeaderCell>Захиалга</Table.HeaderCell>
            <Table.HeaderCell>Бараа</Table.HeaderCell>
            <Table.HeaderCell>Огноо</Table.HeaderCell>
            <Table.HeaderCell>Төлөв</Table.HeaderCell>
            <Table.HeaderCell />
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows.length === 0 && !loading && (
            <Table.Row>
              <Table.Cell colSpan={6}>
                <Text className="text-ui-fg-subtle py-4" size="small">Буцаалтын хүсэлт алга.</Text>
              </Table.Cell>
            </Table.Row>
          )}
          {rows.map(r => {
            const qty = (r.items || []).reduce((a, b) => a + (b.quantity || 0), 0);
            return (
              <Table.Row key={r.id}>
                <Table.Cell className="font-mono text-xs">{r.id.slice(0, 16)}…</Table.Cell>
                <Table.Cell>{r.display_id ? `#${r.display_id}` : r.order_id.slice(0, 12)}</Table.Cell>
                <Table.Cell>{qty} ш</Table.Cell>
                <Table.Cell>{r.created_at?.slice(0, 10)}</Table.Cell>
                <Table.Cell>
                  <Badge color={statusColor[r.status] || "grey"} size="2xsmall">{r.status}</Badge>
                </Table.Cell>
                <Table.Cell>
                  {r.status === "requested" ? (
                    <Button size="small" variant="primary" isLoading={busy === r.id} onClick={() => approve(r.id)}>
                      Зөвшөөрөх
                    </Button>
                  ) : (
                    <Text className="text-ui-fg-muted" size="small">—</Text>
                  )}
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "Буцаалт",
  icon: ArrowUturnLeft,
});

export default ReturnsPage;
