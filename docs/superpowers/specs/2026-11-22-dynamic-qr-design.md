# Dinamik QR Yönetim Uygulaması — Tasarım

Tarih: 2026-11-22

## Amaç ve neden

Kişisel kullanım için QR üretme ve yönetme web uygulaması. Ana kullanım: mobil uygulamaları App Store / Play Store'a yönlendiren QR kodları. Basılan bir QR'ın hedefi sonradan değiştirilebilmeli (dinamik). Ayrıca kaydedilmeyen, anlık statik QR üretimi olmalı. QR görünümü renklendirilebilmeli.

Tek kullanıcı (sahibi). Dokploy ile kendi sunucusunda, kendi domaininde yayınlanacak.

## Hedefler

- Dinamik QR oluşturma, listeleme, düzenleme, pasifleştirme, silme.
- "Akıllı mağaza" QR: tek kod, okutan cihaza göre iOS → App Store, Android → Play Store, diğer → yedek link.
- "Tek link" dinamik QR: herhangi bir URL'ye yönlendirme, hedef sonradan değişebilir.
- Statik QR: herhangi bir metin/URL, tarayıcıda üretilir, kaydedilmez.
- QR tasarımı: renkler ve şekil seçimi, PNG ve SVG indirme.
- Tek şifre ile korunan yönetim paneli.

## Hedef dışı

- Çok kullanıcı, kayıt, ödeme.
- Detaylı analitik (konum, zaman grafiği). Sadece basit okutma sayısı var.
- Toplu QR üretimi, API.

## Anti-hedefler (çalışsa bile başarısızlık sayılır)

- Basılmış bir QR'ın kendiliğinden bozulması: slug değişmesi, yönlendirme yolunun değişmesi, veri kaybı.
- Yönlendirmenin yavaş olması (okutan kişi bekletilmemeli).
- Okunamayan QR üretilmesi (düşük kontrast vb.) ve kullanıcının uyarılmaması.

## Kısıtlar

- Dokploy üzerinde Docker container olarak çalışır.
- Veritabanı: Dokploy'un PostgreSQL servisi (kullanıcı seçimi).
- Yönlendirme yolu `/r/<slug>` kalıcıdır, asla değiştirilmez.
- Arayüz dili Türkçe.

## Yaklaşımlar

1. **Next.js + SQLite, tek container** — en az parça, dosya kopyalayarak yedek. Önerilen buydu.
2. **Next.js + PostgreSQL** — aynı uygulama, veri Dokploy'un Postgres servisinde. Ek servis yönetimi gerekir ama Dokploy'un hazır yedekleme ve yönetim araçlarını kullanır. **Kullanıcı bunu seçti.**
3. **Ayrı backend (Hono) + ayrı React SPA** — çok yüksek trafik için mantıklı, burada gereksiz karmaşıklık. Elendi.

## Kullanıcının kararları

- QR ortasına logo eklenebilecek ("hepsini yap").

- Kişisel kullanım, tek şifre ile giriş.
- Ana kullanım App Store / Play Store yönlendirmesi.
- Statik QR özelliği olacak.
- QR renklendirilebilecek.
- Dokploy'da yayınlanacak.
- Next.js + PostgreSQL.

## Tasarım (builder'ın çağrıları — [C] ile işaretli)

### Teknoloji [C]
- Next.js (App Router, TypeScript), `output: "standalone"`.
- Tailwind CSS.
- Drizzle ORM + `postgres` sürücüsü; migration'lar container açılışında çalışır.
- QR çizimi: `qr-code-styling` (renk, nokta şekli, köşe şekli, PNG/SVG çıktısı). Hem önizleme hem indirme istemci tarafında.

### Ortam değişkenleri
- `DATABASE_URL` — Postgres bağlantısı.
- `ADMIN_PASSWORD` — tek şifre.
- `SESSION_SECRET` — oturum çerezi imzası (en az 32 karakter).
- `PUBLIC_BASE_URL` — QR içine yazılacak taban adres, örn. `https://qr.ornek.com`. QR içeriği her zaman buradan üretilir, istek host'undan değil.

### Kimlik doğrulama [C]
- `/login` sayfası, şifre `ADMIN_PASSWORD` ile sabit zamanlı karşılaştırılır.
- Başarılı girişte imzalı, `httpOnly`, `secure`, `sameSite=lax` çerez (30 gün).
- Middleware: `/r/*`, `/login` ve statik dosyalar hariç her şey giriş ister.
- Giriş denemelerinde basit hız sınırı (IP başına dakikada 5, bellek içi).

### Veri modeli [C]

`qr_codes`
- `id` uuid pk
- `slug` text unique, 7 karakter base62 rastgele, oluşturulduktan sonra **değiştirilemez**
- `name` text — kullanıcının verdiği ad (örn. "Uygulama X — broşür")
- `kind` enum: `store` | `url`
- `ios_url` text null — `store` için
- `android_url` text null — `store` için
- `fallback_url` text — `store` için masaüstü/diğer; `url` için tek hedef
- `style` jsonb — `{ fg, bg, eyeColor, dotType, cornerType, logo? }` (`logo`: data URL, PNG/JPEG/SVG, en fazla 200 KB)
- `active` boolean default true
- `scan_count_ios`, `scan_count_android`, `scan_count_other` integer default 0 [C]
- `created_at`, `updated_at` timestamptz

Kurallar: `store` türünde `ios_url` ve `android_url` en az biri dolu olmalı; eksik olan platform `fallback_url`'ye düşer. Tüm URL'ler `http(s)://` ile başlamalı.

### Yönlendirme `/r/[slug]`
- Route handler, veritabanından slug ile tek sorgu.
- Bulunamadı → 404 sayfası. `active=false` → "Bu bağlantı artık aktif değil" sayfası (410).
- `kind=url` → `fallback_url`'ye 302.
- `kind=store` → User-Agent'a göre:
  - iPhone / iPad / iPod → `ios_url` (yoksa fallback)
  - Android → `android_url` (yoksa fallback)
  - diğer → `fallback_url`
  - Not: iPadOS Safari masaüstü UA gönderebilir; bu durumda fallback'e düşer. Kabul edilen sınırlama.
- Sayaç artırma tek `UPDATE ... SET x = x + 1`, yönlendirmeyi bekletmeden.
- `Cache-Control: no-store` (hedef değişince hemen geçerli olsun).
- 302 kullanılır, 301 asla (tarayıcı önbelleği hedef değişikliğini engellerdi).

### Ekranlar
- **/login** — şifre alanı.
- **/** (Panel) — dinamik QR listesi: ad, tür, kısa link, toplam okutma, aktif/pasif, küçük QR önizleme. Arama kutusu. "Yeni dinamik QR" ve "Statik QR" butonları.
- **/qr/new** ve **/qr/[id]** — form solda, canlı QR önizleme sağda (mobilde alt alta):
  - Ad, tür seçimi (Mağaza / Tek link), ilgili URL alanları.
  - Tasarım: ön plan rengi, arka plan rengi, köşe (göz) rengi, nokta şekli (kare/yuvarlak/nokta), köşe şekli (kare/yuvarlak).
  - Logo yükleme (isteğe bağlı, ortada; logo varsa hata düzeltme seviyesi H).
  - Kontrast düşükse uyarı (WCAG kontrast oranı < 3 → uyarı; ön plan arka plandan açıksa uyarı).
  - PNG (1024px) ve SVG indirme.
  - Düzenlemede: kısa link + kopyala butonu, okutma sayıları, aktif/pasif anahtarı, sil (onaylı).
- **/static** — metin/URL alanı + aynı tasarım kontrolleri + indirme. Hiçbir şey sunucuya gönderilmez veya kaydedilmez.

### Dağıtım
- Çok aşamalı `Dockerfile` (node:22-alpine), standalone çıktı, açılışta migration.
- `README` içinde Dokploy adımları: Postgres servisi oluştur, uygulamayı ekle, ortam değişkenleri, domain bağla.

### Test [C]
- Birim: UA → platform seçimi, URL doğrulama, slug üretimi, kontrast hesaplama.
- Entegrasyon: `/r/[slug]` yönlendirme davranışları (store/url/pasif/yok), giriş koruması.

## Builder'a kalanlar
- Görsel stil detayları (renk paleti, tipografi) — sade, kullanışlı panel.
- Bileşen yapısı ve dosya düzeni.
- Hız sınırının tam uygulaması.
