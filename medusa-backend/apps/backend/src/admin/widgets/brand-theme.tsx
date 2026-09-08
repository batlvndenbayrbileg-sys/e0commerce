import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { useEffect } from "react";

/**
 * NARAN brand theme for the Medusa admin. Medusa's built-in accent is blue
 * (--fg/bg/border-interactive = rgba(59,130,246)); this recolors it to NARAN's
 * warm accent so links, focus rings, active nav items and selected states match
 * the storefront brand. Injected as a single <style> in <head> (persists across
 * client-side navigation), and mounted on the same broad zones as the language
 * toggle — including `login.before`, so branding shows from the login screen on.
 *
 * `!important` on the custom-property declarations makes this :root block win in
 * both light and dark mode without having to duplicate the .dark selector.
 */
const BRAND_CSS = `
:root {
  --fg-interactive: rgba(255, 106, 26, 1) !important;        /* #FF6A1A */
  --fg-interactive-hover: rgba(232, 85, 10, 1) !important;   /* #E8550A */
  --bg-interactive: rgba(232, 85, 10, 1) !important;
  --border-interactive: rgba(232, 85, 10, 1) !important;
}
`;

const BrandTheme = () => {
  useEffect(() => {
    const ID = "naran-brand-theme";
    if (typeof document === "undefined" || document.getElementById(ID)) return;
    const style = document.createElement("style");
    style.id = ID;
    style.textContent = BRAND_CSS;
    document.head.appendChild(style);
  }, []);
  return null;
};

export const config = defineWidgetConfig({
  zone: [
    "login.before",
    "order.list.before",
    "product.list.before",
    "customer.list.before",
    "inventory_item.list.before",
    "promotion.list.before",
    "price_list.list.before",
    "customer_group.list.before",
    "product_collection.list.before",
    "product_category.list.before",
    "campaign.list.before",
    "reservation.list.before",
    "user.list.before",
    "sales_channel.list.before",
    "region.list.before",
    "tax.list.before",
    "return_reason.list.before",
  ],
});

export default BrandTheme;
