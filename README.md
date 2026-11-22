# QR Yönetimi

Kendi sunucunda çalışan, açık kaynak **dinamik ve statik QR kod yöneticisi**. Ana kullanım amacı mobil uygulamalar: tek bir QR kodu okutan kişi iPhone kullanıyorsa App Store'a, Android kullanıyorsa Play Store'a gider.

![Dinamik kod listesi](docs/screenshots/liste.png)

## Özellikler

- **Mağaza QR'ı:** Tek kod; iPhone/iPad → App Store, Android → Play Store, bilgisayar → senin belirlediğin web sayfası.
- **Tek link QR'ı:** Herkesi aynı adrese gönderir. Hedefi istediğin zaman değiştirirsin, basılmış kod aynı kalır.
- **Statik QR:** Link, metin ya da telefon numarası. Tamamen tarayıcıda üretilir, hiçbir yere kaydedilmez.
- **Tasarım:** Hazır renk paletleri, nokta ve köşe renkleri, nokta/köşe şekli, ortaya logo. Kontrast düşükse uyarır.
- **İndirme:** PNG (1024 px) ve SVG (baskı için).
- **Okutma sayacı:** Her kod için iOS, Android ve diğer cihaz sayıları.
- **Pasifleştirme:** Kodu silmeden durdur. Okutan kişi "bağlantı aktif değil" sayfası görür.
- **Tek şifre ile giriş**, açık ve karanlık tema, mobil uyumlu arayüz.

| Düzenleme | Karanlık tema |
| --- | --- |
| ![Düzenleme ekranı](docs/screenshots/duzenle.png) | ![Karanlık tema](docs/screenshots/duzenle-karanlik.png) |

| Statik QR | Mobil |
| --- | --- |
| ![Statik QR](docs/screenshots/statik.png) | ![Mobil görünüm](docs/screenshots/mobil.png) |

## Nasıl çalışır?

Dinamik bir kodun içinde hedef link değil, senin sunucundaki kısa bir adres yazar:

```
https://qr.senindomain.com/r/k8Fq2Lm
```

Biri kodu okuttuğunda bu adres açılır. Uygulama cihazı tanır ve kişiyi doğru mağazaya yönlendirir. Hedef linki panelden değiştirdiğinde basılmış kodlar yeni adrese gitmeye başlar.

> **Önemli:** Kodların içindeki domain (`PUBLIC_BASE_URL`) kalıcıdır. Domaini değiştirirsen ya da sunucuyu kapatırsan basılmış bütün dinamik kodlar çalışmaz. Bu yüzden kendi domainini kullan ve sonradan değiştirme.

## Kurulum

Üç yol var. Sunucun varsa en kolayı **Dokploy**.

- [A. Dokploy ile kurulum](#a-dokploy-ile-kurulum-önerilen)
- [B. Docker Compose ile kurulum](#b-docker-compose-ile-kurulum)
- [C. Kendi bilgisayarında geliştirme](#c-kendi-bilgisayarında-geliştirme)

### Gerekenler

- Linux bir sunucu (VPS). En az 1 GB RAM yeterli.
- Bir domain ya da alt alan adı, örneğin `qr.senindomain.com`.
- Kodun bulunduğu bir GitHub reposu. Bu repoyu kendi hesabına **fork** etmen yeterli.

---

### A. Dokploy ile kurulum (önerilen)

[Dokploy](https://dokploy.com), kendi sunucunda uygulama yayınlamayı kolaylaştıran ücretsiz bir paneldir.

#### 1. Dokploy'u kur

Sunucuna SSH ile bağlan ve şu komutu çalıştır:

```bash
curl -sSL https://dokploy.com/install.sh | sh
```

Kurulum bitince tarayıcıdan `http://SUNUCU_IP:3000` adresine git ve yönetici hesabını oluştur. Dokploy zaten kuruluysa bu adımı atla.

#### 2. Domainini sunucuya yönlendir

Domain sağlayıcının DNS ayarlarında bir **A kaydı** ekle:

| Tür | Ad | Değer |
| --- | --- | --- |
| A | `qr` | Sunucunun IP adresi |

Bu örnekte adres `qr.senindomain.com` olur. DNS değişikliğinin yayılması birkaç dakika sürebilir.

#### 3. Proje oluştur

Dokploy panelinde **Projects → Create Project** ile yeni bir proje aç, örneğin `qr`.

#### 4. Veritabanını ekle

1. Proje içinde **Create Service → Database → PostgreSQL** seç.
2. Bir ad ver, örneğin `qr-db`, ve oluştur.
3. Servis açılınca **Deploy** butonuna bas.
4. Aynı sayfadaki **Internal Connection URL** değerini kopyala. Şuna benzer:
   `postgresql://postgres:xxxx@qr-db-abc123:5432/postgres`

#### 5. Uygulamayı ekle

1. Proje içinde **Create Service → Application** seç ve bir ad ver, örneğin `qr-app`.
2. **Provider** bölümünde GitHub'ı seç ve fork ettiğin repoyu, `main` dalını işaretle.
   - Dokploy'u GitHub'a daha önce bağlamadıysan önce **Settings → Git → GitHub** adımını tamamla.
   - Repon herkese açıksa **Git** sağlayıcısını seçip repo adresini de yapıştırabilirsin.
3. **Build Type** olarak **Dockerfile** seç. Dockerfile yolu `Dockerfile` kalsın.
4. **Save** ile kaydet.

#### 6. Ortam değişkenlerini gir

Uygulamanın **Environment** sekmesine şunları yapıştır ve kendi değerlerinle doldur:

```env
DATABASE_URL=<4. adımda kopyaladığın Internal Connection URL>
ADMIN_PASSWORD=<panele giriş şifren>
SESSION_SECRET=<en az 32 karakter rastgele değer>
PUBLIC_BASE_URL=https://qr.senindomain.com
```

`SESSION_SECRET` üretmek için kendi bilgisayarında şu komutu çalıştırabilirsin:

```bash
openssl rand -hex 32
```

| Değişken | Ne işe yarar |
| --- | --- |
| `DATABASE_URL` | Postgres bağlantı adresi |
| `ADMIN_PASSWORD` | Panele giriş şifresi. Uzun ve tahmin edilmesi zor olsun. |
| `SESSION_SECRET` | Giriş çerezini imzalar. Değiştirirsen herkes çıkış yapmış olur. |
| `PUBLIC_BASE_URL` | QR'ların içine yazılan adres. Sonunda `/` olmasın. **Sonradan değiştirme.** |

#### 7. Domaini bağla

1. Uygulamanın **Domains** sekmesinde **Add Domain** de.
2. **Host:** `qr.senindomain.com`
3. **Container Port:** `3000`
4. **HTTPS** açık, **Certificate:** Let's Encrypt.
5. Kaydet.

#### 8. Yayınla

**Deploy** butonuna bas. İlk build birkaç dakika sürer. Container açılırken veritabanı tablolarını kendisi oluşturur.

Bitince `https://qr.senindomain.com` adresine git, şifrenle giriş yap ve ilk kodunu oluştur. 🎉

> Panel sadece **HTTPS** üzerinden çalışır, çünkü giriş çerezi güvenli modda gönderilir. `http://` ile açarsan giriş yapamazsın.

#### 9. Yedek al (önerilir)

Bütün veri tek bir tabloda durur. Dokploy'da veritabanı servisinin **Backups** sekmesinden S3 uyumlu bir depolamaya (AWS S3, Cloudflare R2, Backblaze vb.) günlük otomatik yedek ayarla.

#### Güncelleme

Repoya yeni bir commit geldiğinde Dokploy'da **Deploy** butonuna basman yeterli. İstersen uygulama ayarlarından **Auto Deploy** açarak her push'ta otomatik yayınlatabilirsin.

---

### B. Docker Compose ile kurulum

Dokploy kullanmıyorsan, Docker kurulu herhangi bir sunucuda:

```bash
git clone https://github.com/<kullanici-adin>/<repo-adin>.git qr
cd qr
cp .env.example .env
nano .env        # değerleri doldur (DATABASE_URL'yi boş bırakabilirsin, compose kendisi kurar)
docker compose up -d --build
```

Uygulama `3000` portunda açılır. Önüne HTTPS sağlayan bir ters vekil sunucu (Caddy, Nginx, Traefik) koy ve domainini ona yönlendir. Caddy için en basit örnek:

```
qr.senindomain.com {
  reverse_proxy localhost:3000
}
```

---

### C. Kendi bilgisayarında geliştirme

Gerekenler: **Node.js 22+** ve bir **PostgreSQL 16** veritabanı.

```bash
git clone https://github.com/<kullanici-adin>/<repo-adin>.git qr
cd qr
npm install
cp .env.example .env.local   # DATABASE_URL ve diğer değerleri doldur
                             # yerelde PUBLIC_BASE_URL=http://localhost:3000 kullanabilirsin
npm run db:migrate           # tabloları oluşturur
npm run dev                  # http://localhost:3000
```

Yerelde `npm run dev` ile çalışırken çerez güvenli modda değildir, `http://` ile giriş yapabilirsin.

#### Testler

Testler gerçek bir Postgres veritabanı kullanır ve her testte tabloyu temizler. **Ayrı bir test veritabanı** oluştur:

```bash
createdb qr_test
DATABASE_URL=postgres://localhost:5432/qr_test npm run db:migrate
DATABASE_URL=postgres://localhost:5432/qr_test npm test
```

#### Veritabanı şeması değişirse

```bash
npm run db:generate   # drizzle/ klasörüne yeni migration dosyası ekler, commit et
```

## Sık sorulanlar

**iPad'den okutunca neden App Store yerine web sayfası açılıyor?**
Yeni iPad'ler Safari'de kendini Mac gibi tanıtır, bu yüzden "diğer cihaz" sayılır. Bu durumda "Diğer cihazlar için link" alanına App Store linkini yazabilirsin.

**Bir kodu silersem ne olur?**
O kod basılı olduğu her yerde çalışmaz hale gelir ve bu geri alınamaz. Kodu geçici olarak durdurmak istiyorsan silmek yerine **pasifleştir**.

**Kaç kod oluşturabilirim?**
Sınır yok. Tek bir küçük sunucu binlerce kodu ve okutmayı rahatça kaldırır.

**Okutma sayıları kişisel veri tutuyor mu?**
Hayır. Sadece her kod için iOS / Android / diğer sayaçları artırılır. IP, konum ya da cihaz bilgisi saklanmaz.

## Teknolojiler

Next.js 15 (App Router) · TypeScript · Tailwind CSS 4 · PostgreSQL · Drizzle ORM · [qr-code-styling](https://github.com/kozakdenys/qr-code-styling) · Vitest

## Katkı

Hata bildirimleri ve pull request'ler memnuniyetle karşılanır. Göndermeden önce `npm run typecheck` ve `npm test` komutlarının geçtiğinden emin ol.

## Lisans

[MIT](LICENSE)
