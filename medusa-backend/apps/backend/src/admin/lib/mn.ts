// NARAN-specific Mongolian overrides layered on top of Medusa's built-in `mn`
// locale (@medusajs/dashboard ships a complete mn.json). The language toggle
// (src/admin/widgets/lang-toggle.tsx) deep-merges this bundle over the stock
// translation with overwrite=true, so only these branding keys change and the
// rest of the professionally translated admin is left intact.
export const mnOverrides: Record<string, any> = {
  login: {
    title: "NARAN админд тавтай морил",
    hint: "Бүртгэлдээ нэвтэрч орно уу",
  },
};
