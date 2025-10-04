# 📢 نظام الإعلانات المتقدم - Google AdSense

## 🎯 المميزات

### 1. **Lazy Loading ذكي**
- تحميل الإعلانات فقط عند الحاجة (عند اقترابها من منطقة العرض)
- تحسين الأداء بشكل كبير
- تقليل استهلاك البيانات

### 2. **إدارة شاملة من لوحة التحكم**
- تفعيل/تعطيل الإعلانات بضغطة زر
- إدارة معرف الناشر (Publisher ID)
- تحكم كامل في إعدادات Lazy Loading

### 3. **مواضع الإعلانات القابلة للتخصيص**
- **Header**: أعلى الصفحة
- **Sidebar**: الشريط الجانبي
- **In-Content**: داخل المحتوى
- **Footer**: أسفل الصفحة
- **Between-Posts**: بين المنشورات (مع إمكانية تحديد كل X منشور)
- **Custom**: مواضع مخصصة

### 4. **تحكم لكل صفحة**
- الصفحة الرئيسية (Home)
- صفحة المنشور (Post)
- صفحة التصنيف (Category)
- صفحة الوسم (Tag)
- صفحة البحث (Search)

### 5. **خيارات الإعلان الاحترافية**
- أشكال متعددة: Auto, Rectangle, Vertical, Horizontal, Fluid
- إعلانات متجاوبة (Responsive)
- تحديد الأبعاد المخصصة
- إظهار/إخفاء كل إعلان بشكل منفصل

---

## 📁 بنية المشروع

### الملفات الجديدة:

```
dua-azkari/
├── src/
│   ├── types/
│   │   └── ads.types.ts              # أنواع TypeScript للإعلانات
│   ├── components/
│   │   └── shared/
│   │       ├── AdSlot.tsx            # مكون الإعلان الفردي (مع Lazy Loading)
│   │       └── AdsManager.tsx        # مدير الإعلانات (يجلب الإعدادات ويعرض الإعلانات)
│   └── app/
│       └── (admin)/
│           └── admin/
│               └── settings/
│                   └── ads/
│                       └── page.tsx  # صفحة إدارة الإعلانات
└── ADVANCED_ADS_SYSTEM_DOCUMENTATION.md
```

---

## 🚀 كيفية الاستخدام

### 1. إعداد حساب Google AdSense

1. أنشئ حساب على [Google AdSense](https://www.google.com/adsense/)
2. احصل على **معرف الناشر** (Publisher ID): `ca-pub-xxxxxxxxxxxxxxxx`
3. أنشئ وحدات إعلانية (Ad Units) واحصل على معرفاتها

### 2. إعداد الإعلانات في لوحة التحكم

1. افتح: `https://yoursite.com/admin/settings/ads`
2. فعّل الإعلانات من المفتاح الرئيسي
3. أدخل **معرف الناشر** (Publisher ID)
4. فعّل **Lazy Loading** (موصى به)
5. اختر الصفحة من التبويبات (الرئيسية، المنشور، إلخ)
6. فعّل الإعلانات للصفحة
7. اضغط "إضافة إعلان"
8. املأ البيانات:
   - **الموضع**: اختر المكان
   - **معرف الوحدة الإعلانية**: `ca-pub-xxx/xxxxxxx`
   - **الشكل**: اختر النوع
   - **متجاوب**: فعّل/عطّل
   - للإعلانات بين المنشورات: حدد "إظهار بعد كل X منشور"
9. احفظ التغييرات

### 3. دمج الإعلانات في الصفحات

#### الصفحة الرئيسية:
```tsx
import { AdsManager } from '@/components/shared/AdsManager'

// في أعلى الصفحة
<AdsManager page="home" position="header" />

// داخل المحتوى
<AdsManager page="home" position="in-content" />

// بين المنشورات (في الحلقة)
{recentPosts.map((post, index) => (
  <>
    <PostCard post={post} />
    <AdsManager page="home" position="between-posts" index={index} />
  </>
))}

// في الفوتر
<AdsManager page="home" position="footer" />
```

#### صفحة المنشور:
```tsx
// أعلى الصفحة
<AdsManager page="post" position="header" />

// داخل المحتوى (قبل/بعد المحتوى)
<AdsManager page="post" position="in-content" />

// في الشريط الجانبي
<AdsManager page="post" position="sidebar" />

// في الفوتر
<AdsManager page="post" position="footer" />
```

#### صفحة التصنيف/الوسم:
```tsx
<AdsManager page="category" position="header" />
<AdsManager page="category" position="between-posts" index={index} />
<AdsManager page="category" position="footer" />
```

---

## ⚙️ الإعدادات المتقدمة

### Lazy Loading

**عتبة التحميل (Threshold)**:
- القيمة بالبكسل
- الافتراضي: `200px`
- يبدأ تحميل الإعلان عندما يكون على بُعد X بكسل من منطقة العرض
- قيمة أكبر = تحميل مبكر أكثر
- قيمة أصغر = تحميل متأخر أكثر (توفير أفضل للبيانات)

**مثال**:
```typescript
{
  lazyLoad: true,
  lazyLoadThreshold: 200 // يبدأ التحميل 200px قبل الظهور
}
```

### الإعلانات بين المنشورات

**`afterEvery`**: إظهار بعد كل X منشور

```typescript
{
  position: 'between-posts',
  afterEvery: 3 // إعلان بعد كل 3 منشورات
}
```

**في الكود**:
```tsx
{posts.map((post, index) => (
  <>
    <PostCard post={post} />
    {/* الإعلان يظهر فقط في الفهارس: 2, 5, 8, 11, ... */}
    <AdsManager page="home" position="between-posts" index={index} />
  </>
))}
```

---

## 🎨 تخصيص التصميم

### CSS Classes المضافة:

```css
/* حاوية الإعلانات */
.ads-container {
  /* يمكنك إضافة margin/padding */
}

/* إعلان معين */
.ad-slot {
  /* التنسيق العام */
}

/* حسب الصفحة والموضع */
.ads-home-header { }
.ads-home-in-content { }
.ads-post-sidebar { }
.ads-category-footer { }
```

### تخصيص Placeholder (أثناء التحميل):

في `AdSlot.tsx`:
```tsx
<div className="bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm"
     style={{ minHeight: slot.height || 250 }}>
  <div className="text-center">
    <div className="animate-pulse">⏳</div>
    <div className="mt-2">جاري تحميل الإعلان...</div>
  </div>
</div>
```

---

## 🔒 الأمان وأفضل الممارسات

### 1. **API Routes محمية**
```typescript
// في /api/settings
const session = await auth()
if (!session) return unauthorized()
if (session.user.role !== 'ADMIN') return forbidden()
```

### 2. **Validation**
```typescript
// في الـ Frontend
if (!settings.googleAdSenseId.startsWith('ca-pub-')) {
  alert('معرف الناشر غير صحيح')
  return
}
```

### 3. **Environment Variables**
```bash
# لا تحفظ معلومات حساسة في الكود
# استخدم متغيرات البيئة فقط
GOOGLE_ADSENSE_PUBLISHER_ID=ca-pub-xxxxxxxxxxxxxxxx
```

### 4. **GDPR & Privacy**
- أضف سياسة خصوصية
- أضف إشعار ملفات تعريف الارتباط (Cookie Banner)
- احترم اختيارات المستخدمين

---

## 📊 مراقبة الأداء

### Google Analytics Integration

```tsx
// في ServerMetaTags.tsx
{webmaster.googleAnalyticsId && (
  <>
    <Script src={`https://www.googletagmanager.com/gtag/js?id=${webmaster.googleAnalyticsId}`} strategy="afterInteractive" />
    <Script id="google-analytics" strategy="afterInteractive">
      {`window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${webmaster.googleAnalyticsId}');`}
    </Script>
  </>
)}
```

### مؤشرات الأداء:

- **CLS (Cumulative Layout Shift)**: استخدام Lazy Loading يحسّن CLS
- **LCP (Largest Contentful Paint)**: تأجيل تحميل الإعلانات يحسّن LCP
- **FID (First Input Delay)**: عدم حظر Thread الرئيسي

---

## 🐛 استكشاف الأخطاء

### الإعلانات لا تظهر:

1. **تأكد من تفعيل الإعلانات**:
   - الإعدادات العامة → `enabled: true`
   - إعدادات الصفحة → `pages.home.enabled: true`
   - الإعلان نفسه → `slot.enabled: true`

2. **تأكد من معرف الناشر**:
   - يجب أن يبدأ بـ `ca-pub-`
   - تأكد من أنه صحيح في لوحة تحكم AdSense

3. **تأكد من معرف الوحدة الإعلانية**:
   - يجب أن يكون بالصيغة: `ca-pub-xxx/xxxxxxx`

4. **افتح Console في المتصفح**:
   ```javascript
   // ابحث عن أخطاء AdSense
   console.log(window.adsbygoogle)
   ```

### Lazy Loading لا يعمل:

1. **تأكد من تفعيله**:
   ```typescript
   lazyLoad: true
   ```

2. **جرب تقليل `lazyLoadThreshold`**:
   ```typescript
   lazyLoadThreshold: 100 // بدلاً من 200
   ```

3. **تأكد من دعم المتصفح**:
   - Intersection Observer API مدعوم في جميع المتصفحات الحديثة

### إعلانات فارغة (Placeholder يظهر فقط):

1. **انتظر قليلاً**: AdSense يحتاج وقت للتحميل
2. **تأكد من موافقة AdSense على موقعك**
3. **تأكد من عدم استخدام Ad Blocker**

---

## 📚 الموارد الإضافية

- [Google AdSense Help Center](https://support.google.com/adsense/)
- [AdSense Policy Center](https://support.google.com/adsense/answer/48182)
- [Web.dev - Optimize Ads](https://web.dev/optimize-ads/)
- [Google Publisher Tag (GPT)](https://developers.google.com/publisher-tag)

---

## 🎉 الخلاصة

نظام الإعلانات المتقدم يوفر:

✅ **Lazy Loading ذكي** - توفير البيانات والأداء  
✅ **إدارة سهلة** - لوحة تحكم احترافية  
✅ **تخصيص شامل** - تحكم في كل شيء  
✅ **SEO-Friendly** - لا يؤثر على محركات البحث  
✅ **متوافق مع GDPR** - احترام الخصوصية  

**جاهز للاستخدام في Production!** 🚀

