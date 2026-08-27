import { defineRouteConfig } from "@medusajs/admin-sdk";
import { Tag } from "@medusajs/icons";
import { Container, Heading, Text, Button, Table, Badge, Textarea, toast } from "@medusajs/ui";
import { useEffect, useRef, useState } from "react";

type Stats = {
  total: number;
  published: number;
  draft: number;
  categories: { id: string; name: string; handle: string; count: number }[];
};

type LowStock = { sku: string; variant: string; product: string; handle: string; stock: number };

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
  return res;
}

const nf = (n: number) => new Intl.NumberFormat("mn-MN").format(n || 0);

const CatalogPage = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [lowStock, setLowStock] = useState<LowStock[]>([]);
  const [csv, setCsv] = useState("");
  const [stockCsv, setStockCsv] = useState("");
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [savingStock, setSavingStock] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadStats = async () => {
    try {
      const res = await adminFetch("/catalog/stats");
      setStats(await res.json());
    } catch (e: any) {
      toast.error(e.message || "Статистик ачаалж чадсангүй");
    }
  };
  const loadLowStock = async () => {
    try {
      const res = await adminFetch("/catalog/low-stock?threshold=5");
      setLowStock((await res.json()).variants || []);
    } catch { /* inventory may be off */ }
  };
  useEffect(() => { loadStats(); loadLowStock(); }, []);

  const runStock = async () => {
    if (!stockCsv.trim()) { toast.error("CSV хоосон байна"); return; }
    setSavingStock(true);
    try {
      const res = await adminFetch("/catalog/stock", { method: "POST", body: JSON.stringify({ csv: stockCsv }) });
      const r = await res.json();
      toast.success(`Нөөц шинэчлэгдлээ: ${nf(r.updated)} хувилбар`);
      if (r.notManaged) toast.warning(`${nf(r.notManaged)} хувилбар нөөц хянадаггүй (алгассан)`);
      setStockCsv("");
      await loadLowStock();
    } catch (e: any) {
      toast.error(e.message || "Нөөц шинэчлэх амжилтгүй");
    } finally {
      setSavingStock(false);
    }
  };

  const onFile = async (f?: File) => {
    if (!f) return;
    setCsv(await f.text());
    toast.info(`${f.name} ачаалагдлаа — Импортлох дарна уу`);
  };

  const runImport = async () => {
    if (!csv.trim()) { toast.error("CSV хоосон байна"); return; }
    setImporting(true);
    try {
      const res = await adminFetch("/catalog/import", { method: "POST", body: JSON.stringify({ csv }) });
      const r = await res.json();
      toast.success(`Импорт дууслаа: ${nf(r.created)} нэмэгдсэн, ${nf(r.skipped)} алгассан (${r.seconds}с)`);
      if (r.unmapped?.length) toast.warning(`Тохирохгүй ангилал: ${r.unmapped.join(", ")}`);
      setCsv("");
      if (fileRef.current) fileRef.current.value = "";
      await loadStats();
    } catch (e: any) {
      toast.error(e.message || "Импорт амжилтгүй");
    } finally {
      setImporting(false);
    }
  };

  const runExport = async () => {
    setExporting(true);
    try {
      const res = await adminFetch("/catalog/export");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "naran-catalog.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      toast.error(e.message || "Экспорт амжилтгүй");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h1">Каталог</Heading>
          <Text className="text-ui-fg-subtle" size="small">Барааны нэгдсэн тойм + CSV импорт/экспорт (олон мянган бараанд).</Text>
        </div>
        <Button variant="secondary" size="small" onClick={runExport} isLoading={exporting}>CSV татах</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-px bg-ui-border-base">
        <Stat label="Нийт бараа" value={stats ? nf(stats.total) : "…"} />
        <Stat label="Нийтэлсэн" value={stats ? nf(stats.published) : "…"} />
        <Stat label="Ноорог" value={stats ? nf(stats.draft) : "…"} />
      </div>

      {/* Per-category */}
      <div className="px-6 py-4">
        <Text weight="plus" size="small" className="mb-2">Ангиллаар</Text>
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Ангилал</Table.HeaderCell>
              <Table.HeaderCell>Handle</Table.HeaderCell>
              <Table.HeaderCell className="text-right">Бараа</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {(stats?.categories || []).map(c => (
              <Table.Row key={c.id}>
                <Table.Cell>{c.name}</Table.Cell>
                <Table.Cell className="font-mono text-xs text-ui-fg-subtle">{c.handle}</Table.Cell>
                <Table.Cell className="text-right"><Badge size="2xsmall">{nf(c.count)}</Badge></Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>

      {/* Import */}
      <div className="px-6 py-4">
        <Text weight="plus" size="small" className="mb-1">CSV импорт</Text>
        <Text className="text-ui-fg-subtle mb-3" size="xsmall">
          Багана: <span className="font-mono">handle,title,price,category,sizes,image,description</span>.
          Байгаа handle-ийг алгасна (давхардуулахгүй).
        </Text>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          className="mb-3 block text-sm"
          onChange={e => onFile(e.target.files?.[0])}
        />
        <Textarea
          placeholder={"handle,title,price,category,sizes,image,description\nlipstick-1,NARAN Lip 1,45000,makeup,Nude,,Тайлбар"}
          value={csv}
          onChange={e => setCsv(e.target.value)}
          rows={6}
          className="font-mono text-xs"
        />
        <div className="mt-3">
          <Button variant="primary" onClick={runImport} isLoading={importing} disabled={!csv.trim()}>
            Импортлох
          </Button>
        </div>
      </div>

      {/* Low stock */}
      <div className="px-6 py-4">
        <div className="flex items-center gap-2 mb-2">
          <Text weight="plus" size="small">Бага нөөц (≤5)</Text>
          <Badge color={lowStock.length ? "red" : "green"} size="2xsmall">{nf(lowStock.length)}</Badge>
        </div>
        {lowStock.length === 0 ? (
          <Text className="text-ui-fg-subtle" size="small">Бага нөөцтэй бараа алга.</Text>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Бараа</Table.HeaderCell>
                <Table.HeaderCell>SKU</Table.HeaderCell>
                <Table.HeaderCell className="text-right">Нөөц</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {lowStock.map(v => (
                <Table.Row key={v.sku}>
                  <Table.Cell>{v.product} <span className="text-ui-fg-subtle">· {v.variant}</span></Table.Cell>
                  <Table.Cell className="font-mono text-xs text-ui-fg-subtle">{v.sku}</Table.Cell>
                  <Table.Cell className="text-right">
                    <Badge color={v.stock === 0 ? "red" : "orange"} size="2xsmall">{v.stock}</Badge>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </div>

      {/* Bulk stock update */}
      <div className="px-6 py-4">
        <Text weight="plus" size="small" className="mb-1">Нөөц шинэчлэх (CSV)</Text>
        <Text className="text-ui-fg-subtle mb-3" size="xsmall">
          Багана: <span className="font-mono">handle,stock</span> (бүх хувилбар) эсвэл <span className="font-mono">sku,stock</span> (нэг хувилбар).
        </Text>
        <Textarea
          placeholder={"handle,stock\nglow-serum,50"}
          value={stockCsv}
          onChange={e => setStockCsv(e.target.value)}
          rows={4}
          className="font-mono text-xs"
        />
        <div className="mt-3">
          <Button variant="secondary" onClick={runStock} isLoading={savingStock} disabled={!stockCsv.trim()}>
            Нөөц шинэчлэх
          </Button>
        </div>
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
  label: "Каталог",
  icon: Tag,
});

export default CatalogPage;
