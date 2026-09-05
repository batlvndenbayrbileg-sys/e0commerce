import { medusaIntegrationTestRunner } from "@medusajs/test-utils";
import { createAdminUser, getAdminToken, asUser } from "./helpers";

jest.setTimeout(120_000);

// End-to-end RBAC: boots the real Medusa app against a throwaway test DB and
// exercises the permission middleware over HTTP with real admin auth.
medusaIntegrationTestRunner({
  testSuite: ({ api, getContainer }) => {
    describe("Custom admin RBAC", () => {
      let adminToken: string;
      let viewerToken: string;
      let viewerId: string;

      beforeAll(async () => {
        const container = getContainer();
        await createAdminUser(container, "admin@rbac.test", "supersecret1"); // no role → super_admin
        const viewer = await createAdminUser(container, "viewer@rbac.test", "supersecret1", "report_viewer");
        viewerId = viewer.id;
        adminToken = await getAdminToken(api, "admin@rbac.test", "supersecret1");
        viewerToken = await getAdminToken(api, "viewer@rbac.test", "supersecret1");
      });

      it("requires authentication on custom admin routes", async () => {
        const res = await api.get("/admin/catalog/stats", { validateStatus: () => true });
        expect(res.status).toBe(401);
      });

      it("super_admin (unset role) can reach every custom surface", async () => {
        expect((await api.get("/admin/catalog/stats", asUser(adminToken))).status).toBe(200);
        expect((await api.get("/admin/analytics/overview", asUser(adminToken))).status).toBe(200);
        expect((await api.get("/admin/reports/sales", asUser(adminToken))).status).toBe(200);
        expect((await api.get("/admin/fulfillment/queue", asUser(adminToken))).status).toBe(200);
      });

      it("report_viewer is allowed analytics + reports", async () => {
        expect((await api.get("/admin/analytics/overview", asUser(viewerToken))).status).toBe(200);
        expect((await api.get("/admin/reports/sales", asUser(viewerToken))).status).toBe(200);
      });

      it("report_viewer is denied catalog, fulfillment and team management", async () => {
        expect((await api.get("/admin/catalog/stats", asUser(viewerToken))).status).toBe(403);
        expect((await api.get("/admin/fulfillment/queue", asUser(viewerToken))).status).toBe(403);
        expect(
          (await api.post(`/admin/users/${viewerId}/role`, { role: "support" }, asUser(viewerToken))).status,
        ).toBe(403);
      });

      it("super_admin can assign a role (team.manage)", async () => {
        const res = await api.post(`/admin/users/${viewerId}/role`, { role: "support" }, asUser(adminToken));
        expect(res.status).toBe(200);
        expect(res.data.role).toBe("support");
      });
    });
  },
});
