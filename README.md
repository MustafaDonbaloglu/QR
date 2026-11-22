# QR Yönetimi

Kişisel dinamik/statik QR uygulaması.

- **Mağaza QR:** tek kod; iPhone → App Store, Android → Play Store, diğer → yedek link.
- **Tek link QR:** hedefi sonradan değiştirilebilir.
- **Statik QR:** tarayıcıda üretilir, kaydedilmez.
- Renk, nokta/köşe şekli, ortada logo; PNG (1024px) ve SVG indirme.
- Tek şifreyle giriş. Okutma sayıları iOS / Android / diğer olarak tutulur.

QR'ın içindeki adres `PUBLIC_BASE_URL/r/<kısa-kod>` şeklindedir ve asla değişmez. Domaini değiştirirsen basılmış kodlar çalışmaz; domaini kalıcı seç.

## Dokploy'da yayınlama

1. **Veritabanı:** Dokploy'da projene *Database → PostgreSQL* ekle. Oluşan *Internal Connection URL*'yi kopyala.
2. **Uygulama:** *Application* ekle, kaynak olarak bu repoyu bağla, *Build Type* = **Dockerfile**.
3. **Environment** sekmesine:
   ```
   DATABASE_URL=<1. adımdaki internal URL>
   ADMIN_PASSWORD=<güçlü bir şifre>
   SESSION_SECRET=<openssl rand -hex 32 çıktısı>
   PUBLIC_BASE_URL=https://qr.senindomain.com
   ```
4. **Domains:** `qr.senindomain.com`, port `3000`, HTTPS açık (Let's Encrypt). DNS'te bu alt alan adı için sunucuya A kaydı ekle.
5. **Deploy.** Container açılışta migration'ları kendisi uygular.

Giriş çerezi `secure` olduğu için panel yalnızca HTTPS üzerinden çalışır.

**Yedek:** Dokploy'un Postgres servisinde *Backups* ile S3'e zamanlanmış yedek aç. Tüm veri tek tabloda (`qr_codes`).

## Yerelde geliştirme

```bash
npm install
cp .env.example .env.local   # değerleri doldur
npm run db:migrate
npm run dev
```

Testler bir Postgres veritabanı ister (`tests/setup.ts` içindeki `DATABASE_URL`, varsayılan `localhost:55432/qr_test`):

```bash
DATABASE_URL=postgres://... npm run db:migrate
npm test
```

Şema değişince: `npm run db:generate` (yeni dosya `drizzle/` altına gelir, commit et).
