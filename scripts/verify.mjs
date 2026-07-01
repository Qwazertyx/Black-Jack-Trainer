// Optional end-to-end smoke test. Requires a running dev server (npm run dev)
// and Playwright installed on demand:
//   npm i -D playwright && npx playwright install chromium && node scripts/verify.mjs
import { chromium } from "playwright";

const errors = [];
const logs = [];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });

page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(`console.error: ${msg.text()}`);
  logs.push(`[${msg.type()}] ${msg.text()}`);
});
page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));

async function shot(name) {
  await page.screenshot({ path: `scripts/shots/${name}.png` });
}

try {
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await shot("01-play-initial");

  // --- Play a hand ---
  await page.getByRole("button", { name: "Deal", exact: true }).click();
  await page.waitForTimeout(700);
  await shot("02-play-dealt");

  // Take an action (Hit or Stand — whichever is enabled).
  const actionButtons = ["Stand", "Hit"];
  for (const label of actionButtons) {
    const btn = page.getByRole("button", { name: label, exact: true });
    if ((await btn.count()) && (await btn.isEnabled())) {
      await btn.click();
      break;
    }
  }
  await page.waitForTimeout(900);
  await shot("03-play-after-action");

  // Coach feedback should exist (Correct / Not optimal chip).
  const feedbackVisible =
    (await page.getByText(/Correct|Not optimal/).count()) > 0 ||
    (await page.getByText(/won|lost|Push/).count()) > 0;
  console.log("FEEDBACK_OR_RESULT_VISIBLE:", feedbackVisible);

  // --- Quiz tab ---
  await page.getByRole("button", { name: /Quiz/ }).click();
  await page.waitForTimeout(400);
  await shot("04-quiz");
  const quizBtn = page.getByRole("button", { name: "Stand", exact: true });
  if (await quizBtn.count()) {
    await quizBtn.first().click();
    await page.waitForTimeout(400);
    await shot("05-quiz-answered");
  }

  // --- Counting tab ---
  await page.getByRole("button", { name: /Counting/ }).click();
  await page.waitForTimeout(400);
  await shot("06-counting");

  // --- Stats tab ---
  await page.getByRole("button", { name: /Stats/ }).click();
  await page.waitForTimeout(500);
  await shot("07-stats");

  // --- Settings tab ---
  await page.getByRole("button", { name: /Settings/ }).click();
  await page.waitForTimeout(400);
  await shot("08-settings");

  // Toggle a rule and confirm the chart is present.
  await page.getByRole("button", { name: "Hits (H17)" }).click();
  await page.waitForTimeout(300);
  await shot("09-settings-h17");

  console.log("TABS_OK: true");
} catch (e) {
  errors.push(`script: ${e.message}`);
} finally {
  console.log("\n=== CONSOLE ERRORS ===");
  console.log(errors.length ? errors.join("\n") : "none");
  await browser.close();
  process.exit(errors.length ? 1 : 0);
}
