import { defineRouteConfig } from "@medusajs/admin-sdk";
import { DocumentText } from "@medusajs/icons";
import { Container, Heading, Text, Button, Input, Textarea, Label, Switch, IconButton, toast } from "@medusajs/ui";
import { Trash, Plus, ArrowUpMini, ArrowDownMini } from "@medusajs/icons";
import { useEffect, useState } from "react";
import { usePermissions } from "../../lib/perms";
import { AccessDenied } from "../../lib/AccessDenied";

type Bi = { mn: string; en: string };
type Slide = { kicker: Bi; top: Bi; accent: Bi; desc: Bi; img: string; href: string };
type Promo = { enabled: boolean; kicker: Bi; title: Bi; desc: Bi; cta: Bi; href: string; img: string };
type Content = { hero: Slide[]; promo: Promo };

const emptyBi = (): Bi => ({ mn: "", en: "" });
const emptySlide = (): Slide => ({ kicker: emptyBi(), top: emptyBi(), accent: emptyBi(), desc: emptyBi(), img: "", href: "/shop" });

async function adminFetch(path: string, init?: RequestInit) {
  const res = await fetch(`/admin${path}`, { credentials: "include", headers: { "content-type": "application/json" }, ...init });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as any)?.message || `Request failed (${res.status})`);
  }
  return res.json();
}

// A bilingual field: MN + EN inputs side by side.
const BiField = ({ label, value, onChange, textarea }: { label: string; value: Bi; onChange: (v: Bi) => void; textarea?: boolean }) => {
  const C = textarea ? Textarea : Input;
  return (
    <div className="flex flex-col gap-1">
      <Label size="small">{label}</Label>
      <div className="grid grid-cols-2 gap-2">
        <C value={value.mn} onChange={(e: any) => onChange({ ...value, mn: e.target.value })} placeholder="Монгол" {...(textarea ? { rows: 2 } : {})} />
        <C value={value.en} onChange={(e: any) => onChange({ ...value, en: e.target.value })} placeholder="English" {...(textarea ? { rows: 2 } : {})} />
      </div>
    </div>
  );
};

const ContentPage = () => {
  const { loading: permLoading, can } = usePermissions();
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminFetch("/cms/homepage")
      .then((j) => setContent(j.content))
      .catch((e) => toast.error(e.message || "Ачаалж чадсангүй"))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    if (!content) return;
    setSaving(true);
    try {
      await adminFetch("/cms/homepage", { method: "POST", body: JSON.stringify({ content }) });
      toast.success("Хадгаллаа — нүүр хуудсанд тусгагдана");
    } catch (e: any) {
      toast.error(e.message || "Хадгалах амжилтгүй");
    } finally {
      setSaving(false);
    }
  };

  const setSlide = (i: number, patch: Partial<Slide>) =>
    setContent((c) => c && ({ ...c, hero: c.hero.map((s, idx) => (idx === i ? { ...s, ...patch } : s)) }));
  const move = (i: number, dir: -1 | 1) =>
    setContent((c) => {
      if (!c) return c;
      const j = i + dir;
      if (j < 0 || j >= c.hero.length) return c;
      const hero = [...c.hero];
      [hero[i], hero[j]] = [hero[j], hero[i]];
      return { ...c, hero };
    });

  if (!permLoading && !can("content.write")) {
    return <AccessDenied title="Контент" perm="content.write" />;
  }
  if (loading || !content) {
    return <Container className="p-6"><Text className="text-ui-fg-subtle">Ачаалж байна…</Text></Container>;
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h1">Контент — Нүүр хуудас</Heading>
          <Text className="text-ui-fg-subtle" size="small">Hero слайд ба урамшууллын баннерыг MN/EN-ээр удирдана.</Text>
        </div>
        <Button variant="primary" onClick={save} isLoading={saving}>Хадгалах</Button>
      </div>

      {/* Hero slides */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <Text weight="plus" size="small">Hero слайдууд ({content.hero.length})</Text>
          <Button variant="secondary" size="small" onClick={() => setContent((c) => c && ({ ...c, hero: [...c.hero, emptySlide()] }))}>
            <Plus /> Слайд нэмэх
          </Button>
        </div>
        {content.hero.length === 0 && (
          <Text className="text-ui-fg-subtle" size="small">Слайд алга — нүүр хуудас өгөгдмөл (default) хувилбарыг харуулна.</Text>
        )}
        <div className="flex flex-col gap-5">
          {content.hero.map((s, i) => (
            <div key={i} className="rounded-lg border border-ui-border-base p-4">
              <div className="flex items-center justify-between mb-3">
                <Text weight="plus" size="small">Слайд {i + 1}</Text>
                <div className="flex items-center gap-1">
                  <IconButton size="small" variant="transparent" disabled={i === 0} onClick={() => move(i, -1)}><ArrowUpMini /></IconButton>
                  <IconButton size="small" variant="transparent" disabled={i === content.hero.length - 1} onClick={() => move(i, 1)}><ArrowDownMini /></IconButton>
                  <IconButton size="small" variant="transparent" onClick={() => setContent((c) => c && ({ ...c, hero: c.hero.filter((_, idx) => idx !== i) }))}><Trash /></IconButton>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <BiField label="Kicker (жижиг гарчиг)" value={s.kicker} onChange={(v) => setSlide(i, { kicker: v })} />
                <BiField label="Гол мөр" value={s.top} onChange={(v) => setSlide(i, { top: v })} />
                <BiField label="Онцлох үг (accent)" value={s.accent} onChange={(v) => setSlide(i, { accent: v })} />
                <BiField label="Тайлбар" value={s.desc} onChange={(v) => setSlide(i, { desc: v })} textarea />
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <Label size="small">Зургийн URL</Label>
                    <Input value={s.img} onChange={(e) => setSlide(i, { img: e.target.value })} placeholder="https://…" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label size="small">Холбоос</Label>
                    <Input value={s.href} onChange={(e) => setSlide(i, { href: e.target.value })} placeholder="/shop" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Promo banner */}
      <div className="px-6 py-4">
        <div className="flex items-center gap-3 mb-3">
          <Text weight="plus" size="small">Урамшууллын баннер</Text>
          <Switch checked={content.promo.enabled} onCheckedChange={(v) => setContent((c) => c && ({ ...c, promo: { ...c.promo, enabled: v } }))} />
          <Text className="text-ui-fg-subtle" size="xsmall">{content.promo.enabled ? "Идэвхтэй" : "Идэвхгүй"}</Text>
        </div>
        <div className="flex flex-col gap-3">
          <BiField label="Kicker" value={content.promo.kicker} onChange={(v) => setContent((c) => c && ({ ...c, promo: { ...c.promo, kicker: v } }))} />
          <BiField label="Гарчиг" value={content.promo.title} onChange={(v) => setContent((c) => c && ({ ...c, promo: { ...c.promo, title: v } }))} />
          <BiField label="Тайлбар" value={content.promo.desc} onChange={(v) => setContent((c) => c && ({ ...c, promo: { ...c.promo, desc: v } }))} textarea />
          <BiField label="Товчны текст" value={content.promo.cta} onChange={(v) => setContent((c) => c && ({ ...c, promo: { ...c.promo, cta: v } }))} />
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <Label size="small">Зургийн URL</Label>
              <Input value={content.promo.img} onChange={(e) => setContent((c) => c && ({ ...c, promo: { ...c.promo, img: e.target.value } }))} placeholder="https://… (хоосон бол өгөгдмөл)" />
            </div>
            <div className="flex flex-col gap-1">
              <Label size="small">Холбоос</Label>
              <Input value={content.promo.href} onChange={(e) => setContent((c) => c && ({ ...c, promo: { ...c.promo, href: e.target.value } }))} placeholder="/shop?filter=sale" />
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-4">
        <Button variant="primary" onClick={save} isLoading={saving}>Хадгалах</Button>
      </div>
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "Контент",
  icon: DocumentText,
});

export default ContentPage;
