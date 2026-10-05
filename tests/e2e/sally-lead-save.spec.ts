import { expect, test, type Page } from "@playwright/test";
import { Pool } from "pg";

test.use({ storageState: "playwright/.auth/user.json" });

let pool: Pool | undefined;
const emails = new Set<string>();
const liveIntent = process.env.SALLY_LIVE_INTENT === "1";

test.beforeAll(() => {
  const host = new URL(process.env.DATABASE_URL ?? "postgres://invalid").hostname;
  if (!["localhost", "127.0.0.1", "[::1]"].includes(host)) {
    throw new Error("Sally lead proofs require the local demo database");
  }
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
});

test.afterEach(async () => {
  if (pool && emails.size) {
    await pool.query('DELETE FROM "crm_Leads" WHERE email = ANY($1)', [[...emails]]);
  }
  emails.clear();
});

test.afterAll(async () => {
  await pool?.end();
});

async function mockFillIntent(page: Page, email: string) {
  await page.route("**/api/v1/runtime/intent", async (route) => {
    const headers = {
      "access-control-allow-origin": "http://localhost:3000",
      "access-control-allow-headers": "authorization,content-type",
      "access-control-allow-methods": "POST,OPTIONS",
    };
    if (route.request().method() === "OPTIONS") {
      await route.fulfill({ status: 204, headers });
      return;
    }
    const body = {
      choices: [{
        message: {
          tool_calls: [{
            function: {
              name: "fill_fields",
              arguments: JSON.stringify({
                workflowId: "crm_leads_components_NewLeadForm.tsx_draft",
                fields: [
                  { targetId: "first-name-3", value: "Santa" },
                  { targetId: "last-name-3", value: "Claus" },
                  { targetId: "email-5", value: email },
                  { targetId: "jobtitle", value: "Head of Present Distribution" },
                ],
              }),
            },
          }],
        },
      }],
    };
    await route.fulfill({
      status: 200,
      headers,
      contentType: "application/json",
      body: JSON.stringify(body),
    });
  });
}

async function installMockRealtime(page: Page) {
  await page.addInitScript(() => {
    const NativeWebSocket = window.WebSocket;
    const state = {
      sockets: [] as MockSocket[],
      sent: [] as unknown[],
      closeCount: 0,
      trackStopCount: 0,
    };

    class MockSocket {
      private listeners = new Map<string, Set<(event: { data?: unknown }) => void>>();
      private closed = false;

      constructor() {
        state.sockets.push(this);
        queueMicrotask(() => this.emit("open", {}));
      }

      addEventListener(type: string, listener: (event: { data?: unknown }) => void) {
        let set = this.listeners.get(type);
        if (!set) {
          set = new Set();
          this.listeners.set(type, set);
        }
        set.add(listener);
      }

      send(data: string) {
        state.sent.push(JSON.parse(data));
      }

      close() {
        if (this.closed) return;
        this.closed = true;
        state.closeCount += 1;
        this.emit("close", {});
      }

      emit(type: string, event: { data?: unknown }) {
        for (const listener of this.listeners.get(type) ?? []) listener(event);
      }
    }

    Object.defineProperty(window, "__sallyVoice", {
      configurable: true,
      value: {
        sent: state.sent,
        stats() {
          return {
            socketCount: state.sockets.length,
            closeCount: state.closeCount,
            trackStopCount: state.trackStopCount,
          };
        },
        emit(payload: unknown) {
          const socket = state.sockets[state.sockets.length - 1];
          socket?.emit("message", { data: JSON.stringify(payload) });
        },
      },
    });
    Object.defineProperty(window, "WebSocket", {
      configurable: true,
      value: new Proxy(NativeWebSocket, {
        construct(target, args, newTarget) {
          const url = String(args[0]);
          if (url.startsWith("wss://api.x.ai/v1/realtime")) {
            return new MockSocket();
          }
          return Reflect.construct(target, args, newTarget);
        },
      }),
    });
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        getUserMedia: async () => ({
          getTracks: () => [{ stop: () => { state.trackStopCount += 1; } }],
        }),
      },
    });
    Object.defineProperty(window, "AudioContext", {
      configurable: true,
      value: undefined,
    });
  });
}

test("Sally ends Talk after declining post-completion help and can restart", async ({ page }) => {
  test.setTimeout(60_000);

  // The form action is deliberately stopped at the browser boundary. This keeps the
  // proof on the real stamped form and receipt lifecycle without writing a CRM row.
  await page.addInitScript(() => {
    document.addEventListener(
      "submit",
      (event) => {
        const form = event.target;
        if (form instanceof HTMLFormElement && form.querySelector('[data-testid="lead-submit-btn"]')) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      },
      true,
    );
  });
  await installMockRealtime(page);

  let stopCalls = 0;
  let actionCalls = 0;
  let actionAborts = 0;
  let blockActions = false;
  await page.route("**/*", async (route) => {
    if (blockActions && route.request().headers()["next-action"]) {
      actionCalls += 1;
      actionAborts += 1;
      await route.abort();
      return;
    }
    await route.continue();
  });
  await page.route("**/api/v1/runtime/voice-session", async (route) => {
    const headers = {
      "access-control-allow-origin": "http://localhost:3000",
      "access-control-allow-headers": "authorization,content-type",
      "access-control-allow-methods": "POST,OPTIONS",
    };
    if (route.request().method() === "OPTIONS") {
      await route.fulfill({ status: 204, headers });
      return;
    }
    await route.fulfill({
      status: 200,
      headers,
      contentType: "application/json",
      body: JSON.stringify({ value: "test-token", holdId: "local-proof-dismiss" }),
    });
  });
  await page.route("**/api/v1/runtime/voice-stop", async (route) => {
    const headers = {
      "access-control-allow-origin": "http://localhost:3000",
      "access-control-allow-headers": "authorization,content-type",
      "access-control-allow-methods": "POST,OPTIONS",
    };
    if (route.request().method() === "OPTIONS") {
      await route.fulfill({ status: 204, headers });
      return;
    }
    stopCalls += 1;
    await route.fulfill({ status: 204, headers, body: "" });
  });
  await page.route("**/api/v1/ingest/events", async (route) => {
    const headers = {
      "access-control-allow-origin": "http://localhost:3000",
      "access-control-allow-headers": "authorization,content-type",
      "access-control-allow-methods": "POST,OPTIONS",
    };
    await route.fulfill({ status: 204, headers, body: "" });
  });

  await page.goto("/en");
  await expect(page.getByTestId("sally-talk")).toBeVisible();
  await page.getByTestId("sally-talk").focus();
  await page.getByTestId("sally-talk").press("Enter");
  await expect(page.getByTestId("sally-status")).toHaveAttribute("data-listening", "true");

  const email = `sally-dismiss-${Date.now()}@example.invalid`;
  await emitRealtime(page, {
    type: "response.function_call_arguments.done",
    name: "fill_fields",
    call_id: "fill_dismiss_1",
    arguments: JSON.stringify({
      workflowId: "crm_leads_components_NewLeadForm.tsx_draft",
      fields: [
        { targetId: "first-name-3", value: "Santa" },
        { targetId: "last-name-3", value: "Claus" },
        { targetId: "email-5", value: email },
        { targetId: "jobtitle", value: "Head of Present Distribution" },
      ],
    }),
  });
  await expect(page).toHaveURL(/\/crm\/leads/, { timeout: 20_000 });

  await emitRealtime(page, {
    type: "conversation.item.input_audio_transcription.updated",
    item_id: "voice_item_fill_dismiss",
    transcript: "yes, fill this",
  });
  await emitRealtime(page, {
    type: "conversation.item.input_audio_transcription.completed",
    item_id: "voice_item_fill_dismiss",
    status: "in_progress",
    transcript: "yes, fill this",
  });
  await emitRealtime(page, {
    type: "conversation.item.input_audio_transcription.completed",
    item_id: "voice_item_fill_dismiss",
    status: "completed",
    transcript: "yes, fill this",
  });
  await expect(page.getByTestId("sally-fill-save")).toBeEnabled();
  blockActions = true;
  await emitRealtime(page, {
    type: "conversation.item.input_audio_transcription.updated",
    item_id: "voice_item_save_dismiss",
    transcript: "yes, save it",
  });
  await emitRealtime(page, {
    type: "conversation.item.input_audio_transcription.completed",
    item_id: "voice_item_save_dismiss",
    status: "in_progress",
    transcript: "yes, save it",
  });
  await emitRealtime(page, {
    type: "conversation.item.input_audio_transcription.completed",
    item_id: "voice_item_save_dismiss",
    status: "completed",
    transcript: "yes, save it",
  });
  await emitRealtime(page, {
    type: "conversation.item.input_audio_transcription.completed",
    item_id: "voice_item_save_dismiss",
    status: "completed",
    transcript: "yes, save it",
  });
  await expect(page.getByTestId("sally-caption")).toContainText(/Submitted to the form/i);
  await expect(page.getByTestId("sally-fill-save")).toBeDisabled();
  expect(actionCalls).toBe(0);
  expect(actionAborts).toBe(0);

  // Simulate the host's successful close callback after the submit has been armed.
  await expect(page.getByTestId("sally-fill")).toBeVisible();
  await page.getByRole("button", { name: /close/i }).last().click();
  await expect(page.getByTestId("sally-caption")).toContainText(/Anything else/i);
  await expect(page.getByTestId("sally-status")).toHaveAttribute("data-listening", "true");

  await emitRealtime(page, {
    type: "conversation.item.input_audio_transcription.updated",
    item_id: "voice_item_no_thanks",
    transcript: "no thanks",
  });
  await emitRealtime(page, {
    type: "conversation.item.input_audio_transcription.completed",
    item_id: "voice_item_no_thanks",
    status: "in_progress",
    transcript: "no thanks",
  });
  await emitRealtime(page, {
    type: "conversation.item.input_audio_transcription.completed",
    item_id: "voice_item_no_thanks",
    status: "completed",
    transcript: "no thanks",
  });
  await emitRealtime(page, {
    type: "response.function_call_arguments.done",
    name: "end_session",
    call_id: "end_session_1",
    arguments: "{}",
  });
  await expect(page.getByTestId("sally-status")).toHaveAttribute("data-listening", "false");
  await expect(page.getByTestId("sally-talk")).toHaveAttribute("aria-label", "Start talking");
  await expect(page.getByTestId("sally-widget")).toHaveAttribute("data-open", "false");
  await expect(page.locator("#sally-highlight-overlay")).not.toBeVisible();
  await expect.poll(() => stopCalls).toBe(1);
  const closedAfterDismiss = await page.evaluate(() =>
    (window as unknown as { __sallyVoice: { stats(): { closeCount: number; trackStopCount: number } } }).__sallyVoice.stats(),
  );
  expect(closedAfterDismiss.closeCount).toBe(1);
  expect(closedAfterDismiss.trackStopCount).toBe(1);

  // Late events from the retired conversation must not reopen or re-submit anything.
  await emitRealtime(page, {
    type: "response.function_call_arguments.done",
    name: "end_session",
    call_id: "end_session_late",
    arguments: "{}",
  });
  await expect(page.getByTestId("sally-status")).toHaveAttribute("data-listening", "false");
  expect(stopCalls).toBe(1);

  await page.evaluate(() => {
    (document.querySelector('[data-testid="sally-talk"]') as HTMLButtonElement).click();
  });
  await expect(page.getByTestId("sally-status")).toHaveAttribute("data-listening", "true");
  const restarted = await page.evaluate(() =>
    (window as unknown as { __sallyVoice: { stats(): { socketCount: number } } }).__sallyVoice.stats().socketCount,
  );
  expect(restarted).toBe(2);
  await page.evaluate(() => {
    (document.querySelector('[data-testid="sally-talk"]') as HTMLButtonElement).click();
  });
  await expect(page.getByTestId("sally-status")).toHaveAttribute("data-listening", "false");
  await expect.poll(() => stopCalls).toBe(2);
  const restartedStopped = await page.evaluate(() =>
    (window as unknown as { __sallyVoice: { stats(): { trackStopCount: number } } }).__sallyVoice.stats().trackStopCount,
  );
  expect(restartedStopped).toBe(2);
});

async function emitRealtime(page: Page, payload: unknown) {
  await page.evaluate((event) => {
    (window as unknown as { __sallyVoice: { emit(value: unknown): void } }).__sallyVoice.emit(event);
  }, payload);
}

async function fillLead(page: Page, email: string) {
  await page.goto("/en");
  const input = page.getByTestId("sally-input");
  await expect(input).toBeVisible();
  await input.fill(
    `Create a lead with first name Santa, last name Claus, email ${email}, and job title Head of Present Distribution. Leave company and other optional fields blank.`,
  );
  await input.press("Enter");
  await expect(page).toHaveURL(/\/crm\/leads/, { timeout: 20_000 });
  await expect(page.getByLabel("First name", { exact: true })).toHaveValue("Santa");
  await expect(page.getByLabel("Last name", { exact: true })).toHaveValue("Claus");
  await expect(page.getByLabel("Email", { exact: true })).toHaveValue(email);
  await expect(page.getByLabel("Job title", { exact: true })).toHaveValue("Head of Present Distribution");
  await expect(page.getByTestId("sally-fill")).toHaveAttribute("data-receipt", "true");
  await expect(page.getByTestId("sally-fill-save")).toBeEnabled();
}

for (const confirmation of ["text", "button"] as const) {
  test(`Sally creates one lead with ${confirmation} Save confirmation`, async ({ page }) => {
    test.setTimeout(liveIntent ? 60_000 : 30_000);
    const email = `sally-lead-${confirmation}-${Date.now()}@example.invalid`;
    emails.add(email);
    if (!liveIntent) await mockFillIntent(page, email);

    await fillLead(page, email);
    await page.getByTestId("sally-input").fill("Yes, fill this");
    await page.getByTestId("sally-input").press("Enter");
    await expect(page.getByTestId("sally-fill-save")).toBeEnabled();
    await expect(page.getByTestId("leads-table").getByRole("row").filter({ hasText: email })).toHaveCount(0);

    if (confirmation === "button") {
      await page.getByTestId("sally-fill-save").click();
    } else {
      const response = liveIntent
        ? page.waitForResponse((res) => res.url().endsWith("/api/v1/runtime/intent") && res.request().method() === "POST")
        : undefined;
      await page.getByTestId("sally-input").fill(
        liveIntent
          ? "I have reviewed all of the information shown in the lead form and I authorize you to save this lead now."
          : "Save",
      );
      await page.getByTestId("sally-input").press("Enter");
      if (response) {
        const body = await (await response).json();
        expect(body.choices[0].message.tool_calls[0].function.name).toBe("confirm_save");
      }
    }

    await expect(page.locator('[data-sonner-toast][data-type="success"]').first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("sally-fill")).not.toBeVisible();
    await expect(page.locator("#sally-highlight-overlay")).not.toBeVisible();
    await expect(page.getByRole("heading", { name: /Create new Lead/i })).not.toBeVisible();
    await expect(page.getByTestId("sally-caption")).toContainText(/Anything else/i);
    await expect(page.getByTestId("leads-table").getByRole("row").filter({ hasText: email })).toHaveCount(1);
    const saved = await pool!.query(
      'SELECT "firstName" AS first_name, "lastName" AS last_name, "jobTitle" AS job_title FROM "crm_Leads" WHERE email = $1',
      [email],
    );
    expect(saved.rows).toEqual([{ first_name: "Santa", last_name: "Claus", job_title: "Head of Present Distribution" }]);
  });
}

test("Sally Talk saves one lead from final transcript and stays active", async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  const email = `sally-lead-voice-${Date.now()}@example.invalid`;
  emails.add(email);
  await installMockRealtime(page);
  await page.route("**/api/v1/runtime/voice-session", async (route) => {
    const headers = {
      "access-control-allow-origin": "http://localhost:3000",
      "access-control-allow-headers": "authorization,content-type",
      "access-control-allow-methods": "POST,OPTIONS",
    };
    if (route.request().method() === "OPTIONS") {
      await route.fulfill({ status: 204, headers });
      return;
    }
    await route.fulfill({
      status: 200,
      headers,
      contentType: "application/json",
      body: JSON.stringify({ value: "test-token", holdId: "local-proof" }),
    });
  });
  await page.route("**/api/v1/runtime/voice-stop", async (route) => {
    const headers = {
      "access-control-allow-origin": "http://localhost:3000",
      "access-control-allow-headers": "authorization,content-type",
      "access-control-allow-methods": "POST,OPTIONS",
    };
    if (route.request().method() === "OPTIONS") {
      await route.fulfill({ status: 204, headers });
      return;
    }
    await route.fulfill({ status: 204, headers, body: "" });
  });

  await page.goto("/en");
  await expect(page.getByTestId("sally-talk")).toBeVisible();
  const talk = page.getByTestId("sally-talk");
  await talk.focus();
  await talk.press("Enter");
  await expect(page.getByTestId("sally-status")).toHaveAttribute("data-listening", "true");

  await emitRealtime(page, {
    type: "response.function_call_arguments.done",
    name: "fill_fields",
    call_id: "fill_voice_1",
    arguments: JSON.stringify({
      workflowId: "crm_leads_components_NewLeadForm.tsx_draft",
      fields: [
        { targetId: "first-name-3", value: "Santa" },
        { targetId: "last-name-3", value: "Claus" },
        { targetId: "email-5", value: email },
        { targetId: "jobtitle", value: "Head of Present Distribution" },
      ],
    }),
  });
  await expect(page).toHaveURL(/\/crm\/leads/, { timeout: 20_000 });
  await expect(page.getByTestId("sally-fill-save")).toBeEnabled();

  await emitRealtime(page, {
    type: "conversation.item.input_audio_transcription.updated",
    item_id: "voice_item_fill",
    transcript: "yes, fill this",
  });
  await emitRealtime(page, {
    type: "conversation.item.input_audio_transcription.completed",
    item_id: "voice_item_fill",
    status: "in_progress",
    transcript: "yes, fill this",
  });
  await emitRealtime(page, {
    type: "conversation.item.input_audio_transcription.completed",
    item_id: "voice_item_fill",
    status: "completed",
    transcript: "yes, fill this",
  });
  await expect(page.getByTestId("sally-fill-save")).toBeEnabled();
  await expect(page.getByTestId("leads-table").getByRole("row").filter({ hasText: email })).toHaveCount(0);

  await emitRealtime(page, {
    type: "conversation.item.input_audio_transcription.updated",
    item_id: "voice_item_save",
    transcript: "yes, save it",
  });
  await emitRealtime(page, {
    type: "conversation.item.input_audio_transcription.completed",
    item_id: "voice_item_save",
    status: "in_progress",
    transcript: "yes, save it",
  });
  await expect(page.getByTestId("sally-fill-save")).toBeEnabled();
  await expect(page.getByTestId("leads-table").getByRole("row").filter({ hasText: email })).toHaveCount(0);
  await emitRealtime(page, {
    type: "conversation.item.input_audio_transcription.completed",
    item_id: "voice_item_save",
    status: "completed",
    transcript: "yes, save it",
  });
  await emitRealtime(page, {
    type: "conversation.item.input_audio_transcription.completed",
    item_id: "voice_item_save",
    status: "completed",
    transcript: "yes, save it",
  });
  await expect(page.locator('[data-sonner-toast][data-type="success"]').first()).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTestId("sally-fill")).not.toBeVisible();
  await expect(page.locator("#sally-highlight-overlay")).not.toBeVisible();
  await expect(page.getByTestId("leads-table").getByRole("row").filter({ hasText: email })).toHaveCount(1);
  await expect(page.getByTestId("sally-caption")).toContainText(/Anything else/i);
  await expect(page.getByTestId("sally-status")).toHaveAttribute("data-listening", "true");
  await expect(page.getByTestId("sally-talk")).toHaveAttribute("aria-label", "End conversation");

  const forceMessages = await page.evaluate(() => {
    const sent = (window as unknown as { __sallyVoice: { sent: Array<{ type?: string; item?: { type?: string; content?: Array<{ text?: string }> } }> } }).__sallyVoice.sent;
    return sent
      .filter((event) => event.type === "conversation.item.create" && event.item?.type === "force_message")
      .flatMap((event) => event.item?.content?.map((part) => part.text ?? "") ?? []);
  });
  expect(forceMessages).toContain("Say Save when this looks right.");
  expect(forceMessages).toContain("Anything else?");
  expect(forceMessages.filter((text) => text === "Anything else?")).toHaveLength(1);
  expect(forceMessages.join(" ")).not.toMatch(/Santa|Claus/);
  const screenshotPath = testInfo.outputPath("sally-lead-talk-after-save.png");
  await page.screenshot({ path: screenshotPath, fullPage: true });
  await testInfo.attach("sally-lead-talk-after-save", {
    path: screenshotPath,
    contentType: "image/png",
  });

  const saved = await pool!.query(
    'SELECT "firstName" AS first_name, "lastName" AS last_name, "jobTitle" AS job_title FROM "crm_Leads" WHERE email = $1',
    [email],
  );
  expect(saved.rows).toEqual([{ first_name: "Santa", last_name: "Claus", job_title: "Head of Present Distribution" }]);
});
