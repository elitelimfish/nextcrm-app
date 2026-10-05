import { expect, test } from "@playwright/test";
import { Pool } from "pg";

test.use({ storageState: "playwright/.auth/user.json" });
let pool: Pool | undefined;
const emails = new Set<string>();
const liveIntent = process.env.SALLY_LIVE_INTENT === "1";

// These proofs intentionally create disposable contacts only in the local demo DB.
test.beforeAll(() => {
  const host = new URL(process.env.DATABASE_URL ?? "postgres://invalid").hostname;
  if (!["localhost", "127.0.0.1", "[::1]"].includes(host)) {
    throw new Error("Sally contact proofs require the local demo database");
  }
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
});
test.afterEach(async () => {
  if (pool && emails.size) await pool.query('DELETE FROM "crm_Contacts" WHERE email = ANY($1)', [[...emails]]);
  emails.clear();
});
test.afterAll(async () => { await pool?.end(); });

for (const confirmation of ["text", "button"] as const) {
  test(`Sally creates one contact from the main screen using ${confirmation} confirmation`, async ({ page }) => {
    test.setTimeout(liveIntent ? 60_000 : 30_000);
    const email = `sally-proof-${confirmation}-${Date.now()}@example.invalid`;
    emails.add(email);
    if (!liveIntent) await page.route("**/api/v1/runtime/intent", async (route) => {
      const headers = {
        "access-control-allow-origin": "http://localhost:3000",
        "access-control-allow-headers": "authorization,content-type",
        "access-control-allow-methods": "POST,OPTIONS",
      };
      if (route.request().method() === "OPTIONS") {
        await route.fulfill({ status: 204, headers });
        return;
      }
      await route.fulfill({ status: 200, headers, contentType: "application/json", body: JSON.stringify({
        choices: [{ message: { tool_calls: [{ function: {
          name: "fill_fields", arguments: JSON.stringify({
            workflowId: "crm_contacts_components_NewContactForm.tsx_draft",
            fields: [
              { targetId: "first-name", value: "Santa" },
              { targetId: "last-name", value: "Claus" },
              { targetId: "email-8", value: email },
              { targetId: "position-3", value: "Head of Present Distribution" },
            ],
          }),
        } }] } }],
      }) });
    });

    await page.goto("/en");
    const input = page.getByTestId("sally-input");
    await expect(input).toBeVisible();
    await input.fill(`Create a contact for Santa Claus, ${email}, Head of Present Distribution`);
    await input.press("Enter");
    await expect(page).toHaveURL(/\/crm\/contacts/, { timeout: 20_000 });
    await expect(page.getByLabel("First name", { exact: true })).toHaveValue("Santa");
    await expect(page.getByLabel("Last name", { exact: true })).toHaveValue("Claus");
    await expect(page.getByLabel("Email", { exact: true })).toHaveValue(email);
    await expect(page.getByLabel("Position", { exact: true })).toHaveValue("Head of Present Distribution");
    await expect(page.getByTestId("sally-fill-save")).toBeEnabled();

    if (confirmation === "button") {
      await page.getByTestId("sally-fill-save").click();
    } else {
      const response = liveIntent ? page.waitForResponse((res) => res.url().endsWith("/api/v1/runtime/intent") && res.request().method() === "POST") : undefined;
      await input.fill(liveIntent
        ? "I have reviewed all of the information shown in the contact form and I authorize you to save this contact now."
        : "Yes, everything looks good. Please input and save it.");
      await input.press("Enter");
      if (response) {
        const body = await (await response).json();
        expect(body.choices[0].message.tool_calls[0].function.name).toBe("confirm_save");
      }
    }
    await expect(page.locator('[data-sonner-toast][data-type="success"]').first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("heading", { name: "Create new Contact" })).not.toBeVisible();
    await expect(page.getByTestId("contacts-table").getByRole("row").filter({ hasText: email })).toHaveCount(1);
    await expect(page.getByTestId("sally-fill")).not.toBeVisible();
    await expect(page.getByRole("heading", { name: "Create new Contact" })).not.toBeVisible();
    const saved = await pool!.query('SELECT first_name, last_name, position FROM "crm_Contacts" WHERE email = $1', [email]);
    expect(saved.rows).toEqual([{ first_name: "Santa", last_name: "Claus", position: "Head of Present Distribution" }]);
  });
}
