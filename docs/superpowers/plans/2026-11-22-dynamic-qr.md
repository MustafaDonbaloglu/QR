# Dinamik QR Yönetim Uygulaması Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tek şifreli, Dokploy'da çalışan; mağaza/tek-link dinamik QR ve statik QR üreten, renklendirilebilir QR web uygulaması.

**Architecture:** Next.js App Router tek uygulama. `/r/[slug]` route handler Postgres'ten kaydı okuyup UA'ya göre 302 yapar. Yönetim paneli server actions ile Drizzle üzerinden CRUD; QR çizimi istemcide `qr-code-styling`.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind v4, Drizzle ORM + `postgres`, zod, jose, qr-code-styling, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-22-dynamic-qr-design.md`

## Global Constraints

- Yönlendirme yolu `/r/<slug>`; slug 7 karakter base62, oluşturulduktan sonra değişmez.
- Yönlendirme her zaman 302 + `Cache-Control: no-store`; asla 301.
- QR içeriği `PUBLIC_BASE_URL + "/r/" + slug`; istek host'u kullanılmaz.
- Env: `DATABASE_URL`, `ADMIN_PASSWORD`, `SESSION_SECRET` (≥32 karakter), `PUBLIC_BASE_URL`.
- Çerez: `httpOnly`, `secure` (production), `sameSite=lax`, 30 gün.
- Tüm hedef URL'ler `http://` veya `https://` ile başlar.
- Logo data URL, PNG/JPEG/SVG, ≤200 KB; logo varsa errorCorrectionLevel `H`, yoksa `M`.
- Arayüz metinleri Türkçe.

## Review Focus

1. Slug çakışması — `createQr` unique ihlalinde yeni slug ile tekrar dener (5 deneme). Test: Task 3.
2. iPadOS masaüstü UA (`Macintosh`) → `other`; Android tablet UA → `android`. Test: Task 2.
3. `store` türünde sadece iOS linki dolu; Android okutma fallback'e düşer. Test: Task 2.
4. `javascript:` veya boşluklu URL girişi reddedilir. Test: Task 2.
5. Giriş yapmadan `/qr/*` veya server action çağrısı → `/login`'e yönlendirme; `/r/*` açık kalır. Test: Task 4.

---

### Task 1: İskelet + DB şeması

**Files:** Create `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `vitest.config.ts`, `drizzle.config.ts`, `src/app/layout.tsx`, `src/app/globals.css`, `src/db/schema.ts`, `src/db/index.ts`, `src/db/migrate.ts`, `drizzle/` (generated), `.env.example`, `.gitignore`

**Interfaces:**
- Produces: `db` (drizzle instance), `qrCodes` table, types `QrRow = typeof qrCodes.$inferSelect`, `NewQr = typeof qrCodes.$inferInsert`, `QrKind = "store" | "url"`.
- `qrCodes` columns exactly per spec Veri modeli (`scanCountIos`, `scanCountAndroid`, `scanCountOther`, `style` jsonb typed `QrStyle`).
- `src/db/migrate.ts`: `runMigrations(): Promise<void>` using `drizzle-orm/postgres-js/migrator` on `./drizzle`.

- [ ] git init, create files, `npm install`.
- [ ] `npx drizzle-kit generate` produces `drizzle/0000_*.sql`.
- [ ] Run migrations against local test DB; `\d qr_codes` shows slug unique.
- [ ] Commit `chore: scaffold next app and db schema`.

### Task 2: Saf yardımcılar (platform, doğrulama, slug, kontrast, stil)

**Files:** Create `src/lib/platform.ts`, `src/lib/validate.ts`, `src/lib/slug.ts`, `src/lib/contrast.ts`, `src/lib/style.ts`; Test `tests/unit/*.test.ts`

**Interfaces:**
- `detectPlatform(ua: string | null): "ios" | "android" | "other"` — `/iPhone|iPad|iPod/` → ios, `/Android/` → android.
- `resolveTarget(qr: Pick<QrRow,"kind"|"iosUrl"|"androidUrl"|"fallbackUrl">, p: Platform): string`.
- `qrInputSchema` (zod): `{ name: 1..100, kind, iosUrl?, androidUrl?, fallbackUrl, style }`; `store` için iosUrl|androidUrl en az biri; URL'ler `isHttpUrl`.
- `isHttpUrl(s: string): boolean` — `new URL` parse + protocol http/https.
- `generateSlug(len = 7): string` — `crypto.getRandomValues`, base62.
- `contrastRatio(a: string, b: string): number` (WCAG), `contrastWarning(fg, bg): string | null` — oran < 3 → `"Kontrast düşük, QR okunmayabilir."`; fg luminance > bg luminance → `"Ön plan arka plandan açık; bazı okuyucular okuyamaz."`.
- `QrStyle = { fg: string; bg: string; eyeColor: string; dotType: "square"|"rounded"|"dots"; cornerType: "square"|"rounded"; logo?: string }`, `defaultStyle`, `qrStyleSchema` (hex `#RRGGBB`, logo data URL regex + ≤200 KB).

- [ ] Tests: iPhone/iPad/Android phone/Android tablet/Macintosh/desktop Chrome/null UA; resolveTarget store with only iOS → android gets fallback; `url` kind ignores platform; `isHttpUrl("javascript:alert(1)") === false`, `"ftp://x"` false, `"https://apps.apple.com/app/id1"` true; slug length 7 and `/^[0-9A-Za-z]{7}$/`; `contrastRatio("#000000","#ffffff") ≈ 21`; warning for `#777777`/`#888888`; warning for light-on-dark; schema rejects store with no store links.
- [ ] Run fail, implement, run pass, commit `feat: add pure helpers`.

### Task 3: QR repository

**Files:** Create `src/lib/qr-repo.ts`; Test `tests/integration/qr-repo.test.ts`

**Interfaces:**
- `listQrs(search?: string): Promise<QrRow[]>` (ad ILIKE, `createdAt desc`)
- `getQr(id: string): Promise<QrRow | null>`
- `findBySlug(slug: string): Promise<QrRow | null>`
- `createQr(input: QrInput): Promise<QrRow>` — slug unique ihlalinde (pg code `23505`) 5 kez tekrar.
- `updateQr(id: string, input: QrInput): Promise<QrRow | null>` — slug'a dokunmaz, `updatedAt = now()`.
- `setActive(id: string, active: boolean): Promise<void>`, `deleteQr(id: string): Promise<void>`
- `incrementScan(id: string, p: Platform): Promise<void>` — tek `UPDATE ... + 1`.
- `generateSlug` repo içinde parametrik enjekte edilebilir: `createQr(input, slugFn = generateSlug)`.

- [ ] Tests (test DB, her testten önce truncate): create/get roundtrip; update keeps slug; çakışan slugFn ilk 2 çağrıda mevcut slug döner → yine başarılı; incrementScan ios iki kez → `scanCountIos === 2`; listQrs search filtresi.
- [ ] Fail → implement → pass → commit `feat: add qr repository`.

### Task 4: Auth + yönlendirme

**Files:** Create `src/lib/auth.ts`, `src/lib/rate-limit.ts`, `src/middleware.ts`, `src/app/r/[slug]/route.ts`, `src/app/r/inactive/page.tsx` (veya route içinde HTML), `src/app/login/page.tsx`, `src/app/login/actions.ts`; Test `tests/unit/auth.test.ts`, `tests/integration/redirect.test.ts`

**Interfaces:**
- `checkPassword(input: string): boolean` — `timingSafeEqual` on sha256 digests.
- `createSessionToken(): Promise<string>`, `verifySessionToken(t?: string): Promise<boolean>` (jose HS256, exp 30d). Cookie name `qr_session`.
- `rateLimit(key: string, limit = 5, windowMs = 60_000): boolean`.
- Middleware matcher excludes `/r/`, `/login`, `/_next`, `/favicon.ico`; invalid → redirect `/login`.
- Server actions additionally call `requireAuth()` (`src/lib/auth.ts`) that redirects to `/login`.
- `GET /r/[slug]`: 404 HTML yoksa; 410 HTML "Bu bağlantı artık aktif değil." pasifse; aksi 302 `resolveTarget` + `incrementScan` (await etmeden, `.catch` ile log).

- [ ] Tests: correct/incorrect password; token roundtrip, tampered token false; rate limit 6. çağrıda false; redirect handler: iPhone UA → ios_url 302 + no-store; Android → android_url; desktop → fallback; inactive → 410; unknown → 404.
- [ ] Fail → implement → pass → commit `feat: add auth and redirect`.

### Task 5: QR görsel bileşenleri

**Files:** Create `src/components/QrPreview.tsx`, `src/components/StyleControls.tsx`, `src/lib/qr-options.ts`; Test `tests/unit/qr-options.test.ts`

**Interfaces:**
- `buildQrOptions(data: string, style: QrStyle, size: number): Options` (qr-code-styling) — dotType map: square→`square`, rounded→`rounded`, dots→`dots`; cornerType square→`square`, rounded→`extra-rounded`; eye color both cornersSquare & cornersDot; logo → `image`, `imageOptions { margin: 4, imageSize: 0.3 }`, ECL `H` else `M`.
- `<QrPreview data style size? />` client component, exposes `download(ext: "png"|"svg", name)` via buttons inside.
- `<StyleControls value onChange />` — color inputs, select'ler, logo file input (≤200 KB, aksi hata mesajı), contrast warning.

- [ ] Tests on `buildQrOptions`: ECL H with logo, M without; rounded corner → extra-rounded.
- [ ] Implement, pass, commit `feat: add qr preview and style controls`.

### Task 6: Panel ekranları + statik QR

**Files:** Create `src/app/(admin)/layout.tsx`, `src/app/(admin)/page.tsx`, `src/app/(admin)/qr/new/page.tsx`, `src/app/(admin)/qr/[id]/page.tsx`, `src/app/(admin)/qr/actions.ts`, `src/components/QrForm.tsx`, `src/app/(admin)/static/page.tsx`, `src/lib/env.ts`

**Interfaces:**
- Actions: `saveQrAction(id: string | null, input: QrInput): Promise<{ ok: true; id: string } | { ok: false; error: string }>`, `toggleActiveAction(id, active)`, `deleteQrAction(id)`, `logoutAction()`.
- `publicUrl(slug: string): string` in `src/lib/env.ts`.

- [ ] Build pages per spec Ekranlar; `npm run build` passes.
- [ ] Manual check in browser: login → create store QR → redirect works with UA → edit target → static page downloads PNG/SVG.
- [ ] Commit `feat: add admin screens and static qr`.

### Task 7: Dağıtım

**Files:** Create `Dockerfile`, `.dockerignore`, `scripts/start.mjs`, `README.md`

- `scripts/start.mjs`: runMigrations then start standalone `server.js`.
- README: Dokploy adımları (Postgres servisi, uygulama, env, domain, yedek).
- [ ] `npm run build` + run standalone locally against test DB, `/r/<slug>` 302 works.
- [ ] Commit `chore: add docker deployment`.
