import { MedusaContainer } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";

// Create an admin user with a working emailpass login. `role` (optional) is
// stored on user.metadata.role to exercise RBAC. Uses the auth module's
// register() so the password is hashed by the emailpass provider.
export async function createAdminUser(
  container: MedusaContainer,
  email: string,
  password: string,
  role?: string,
) {
  const userModule: any = container.resolve(Modules.USER);
  const authModule: any = container.resolve(Modules.AUTH);

  const user = await userModule.createUsers({
    email,
    ...(role ? { metadata: { role } } : {}),
  });

  const registered = await authModule.register("emailpass", {
    body: { email, password },
  });
  const authIdentity = registered?.authIdentity;
  if (authIdentity) {
    await authModule.updateAuthIdentities({
      id: authIdentity.id,
      app_metadata: { user_id: user.id },
    });
  }
  return user;
}

// Log in and return a bearer token for the admin API.
export async function getAdminToken(api: any, email: string, password: string): Promise<string> {
  const res = await api.post("/auth/user/emailpass", { email, password });
  return res.data.token;
}

// Axios request config that carries the token and never throws on 4xx/5xx,
// so a test can assert on the status code directly.
export const asUser = (token: string) => ({
  headers: { authorization: `Bearer ${token}` },
  validateStatus: () => true,
});
