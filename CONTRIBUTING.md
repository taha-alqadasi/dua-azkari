# 🤝 دليل المساهمة في مشروع دعاء أذكاري

<div dir="rtl">

شكراً لاهتمامك بالمساهمة في مشروع **دعاء أذكاري**! نحن نرحب بجميع المساهمات سواء كانت تقارير أخطاء، اقتراحات ميزات، تحسينات الكود، أو تحديثات التوثيق.

</div>

---

## 📋 جدول المحتويات

- [قواعد السلوك](#-قواعد-السلوك)
- [كيفية المساهمة](#-كيفية-المساهمة)
- [الإبلاغ عن الأخطاء](#-الإبلاغ-عن-الأخطاء)
- [اقتراح ميزات جديدة](#-اقتراح-ميزات-جديدة)
- [إرسال Pull Request](#-إرسال-pull-request)
- [معايير الكود](#-معايير-الكود)
- [التزامات Git](#-التزامات-git)

---

## 📜 قواعد السلوك

<div dir="rtl">

بالمشاركة في هذا المشروع، أنت توافق على الالتزام بقواعد السلوك التالية:

- **الاحترام**: تعامل مع الجميع باحترام وتقدير
- **التعاون**: ساعد الآخرين وكن منفتحاً على النقد البناء
- **الشمولية**: نرحب بالجميع بغض النظر عن الخلفية أو الخبرة
- **الاحترافية**: حافظ على بيئة عمل احترافية

</div>

---

## 🚀 كيفية المساهمة

### 1️⃣ Fork المشروع

```bash
# انقر على زر Fork في GitHub
# ثم استنسخ المشروع المنسوخ
git clone https://github.com/YOUR-USERNAME/dua-azkari.git
cd dua-azkari
```

### 2️⃣ إنشاء فرع جديد

```bash
# أنشئ فرع للميزة أو الإصلاح
git checkout -b feature/amazing-feature

# أو للإصلاحات
git checkout -b fix/bug-description
```

### 3️⃣ إجراء التغييرات

- اكتب كود نظيف وواضح
- اتبع معايير الكود الموجودة
- أضف تعليقات حيث لزم الأمر
- اختبر التغييرات

### 4️⃣ Commit التغييرات

```bash
git add .
git commit -m "feat: add amazing feature"
```

### 5️⃣ Push للفرع

```bash
git push origin feature/amazing-feature
```

### 6️⃣ فتح Pull Request

- اذهب إلى GitHub repository
- انقر على "New Pull Request"
- اختر الفرع الخاص بك
- املأ قالب PR بالتفاصيل

---

## 🐛 الإبلاغ عن الأخطاء

<div dir="rtl">

عند الإبلاغ عن خطأ، يرجى تضمين:

### المعلومات المطلوبة

- **وصف واضح للخطأ**: ماذا حدث؟
- **خطوات إعادة الإنتاج**: كيف يمكن إعادة إنتاج الخطأ؟
- **السلوك المتوقع**: ماذا كان من المفترض أن يحدث؟
- **Screenshots**: إذا كان ذلك مناسباً
- **البيئة**: OS، Browser، Node version، إلخ

### مثال

```markdown
**الوصف**
لا يمكن رفع ملفات صوتية أكبر من 5MB

**خطوات إعادة الإنتاج**
1. اذهب إلى /admin/media
2. انقر على "رفع ملف"
3. اختر ملف صوتي بحجم 10MB
4. انقر على "رفع"

**السلوك المتوقع**
يجب أن يتم رفع الملف بنجاح

**البيئة**
- OS: Windows 10
- Browser: Chrome 120
- Node: 20.0.0
```

</div>

---

## 💡 اقتراح ميزات جديدة

<div dir="rtl">

نرحب بالأفكار الجديدة! عند اقتراح ميزة:

### المعلومات المطلوبة

- **المشكلة**: ما المشكلة التي تحلها هذه الميزة؟
- **الحل المقترح**: كيف تقترح حل هذه المشكلة؟
- **البدائل**: هل فكرت في حلول بديلة؟
- **السياق الإضافي**: أي معلومات إضافية مفيدة

### مثال

```markdown
**المشكلة**
لا يوجد خيار لتصدير المنشورات إلى PDF

**الحل المقترح**
إضافة زر "تصدير PDF" في صفحة المنشورات

**البدائل**
- تصدير إلى Word
- تصدير إلى Excel

**السياق**
هذه الميزة ستساعد في إنشاء نسخ احتياطية سهلة
```

</div>

---

## 📝 إرسال Pull Request

### قبل إرسال PR

- ✅ تأكد من أن الكود يعمل بدون أخطاء
- ✅ اتبع معايير الكود
- ✅ أضف تعليقات للكود المعقد
- ✅ قم بتحديث التوثيق إذا لزم الأمر
- ✅ اختبر على متصفحات مختلفة إذا كان تغيير UI

### قالب PR

```markdown
## الوصف
وصف مختصر للتغييرات

## نوع التغيير
- [ ] إصلاح خطأ
- [ ] ميزة جديدة
- [ ] تحسين الأداء
- [ ] تحديث التوثيق

## الاختبار
كيف تم اختبار هذا التغيير؟

## Checklist
- [ ] الكود يتبع معايير المشروع
- [ ] تمت مراجعة الكود ذاتياً
- [ ] تم تحديث التوثيق
- [ ] لا توجد تحذيرات جديدة
```

---

## 🎨 معايير الكود

### TypeScript

```typescript
// ✅ جيد
interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
}

async function getPostById(id: string): Promise<Post | null> {
  try {
    const post = await prisma.post.findUnique({ where: { id } });
    return post;
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}

// ❌ سيء
async function getPost(id: any) {
  const post = await prisma.post.findUnique({ where: { id } });
  return post;
}
```

### React Components

```tsx
// ✅ جيد
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

// ❌ سيء
export function Button(props: any) {
  return <button onClick={props.onClick}>{props.label}</button>;
}
```

### CSS/Tailwind

```tsx
// ✅ جيد - استخدم Tailwind classes
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  <h2 className="text-xl font-bold text-gray-800">Title</h2>
</div>

// ❌ سيء - تجنب inline styles
<div style={{ display: 'flex', padding: '16px' }}>
  <h2 style={{ fontSize: '20px' }}>Title</h2>
</div>
```

---

## 📋 التزامات Git

<div dir="rtl">

نستخدم [Conventional Commits](https://www.conventionalcommits.org/) لرسائل commit:

### التنسيق

```
<type>(<scope>): <subject>

<body>

<footer>
```

### الأنواع (Types)

- **feat**: ميزة جديدة
- **fix**: إصلاح خطأ
- **docs**: تحديث التوثيق
- **style**: تنسيق الكود (لا يؤثر على الوظيفة)
- **refactor**: إعادة هيكلة الكود
- **perf**: تحسين الأداء
- **test**: إضافة اختبارات
- **chore**: مهام صيانة

### أمثلة

```bash
# ميزة جديدة
git commit -m "feat(posts): add audio upload functionality"

# إصلاح خطأ
git commit -m "fix(auth): resolve login redirect issue"

# تحديث التوثيق
git commit -m "docs(readme): update installation steps"

# تحسين أداء
git commit -m "perf(api): optimize database queries"

# إعادة هيكلة
git commit -m "refactor(components): simplify Button component"
```

</div>

---

## 🧪 الاختبار

### قبل Submit

```bash
# تشغيل الاختبارات
npm test

# فحص الأخطاء
npm run lint

# فحص TypeScript
npx tsc --noEmit

# بناء المشروع
npm run build
```

---

## 📚 الموارد المفيدة

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)

---

## ❓ أسئلة؟

<div dir="rtl">

إذا كان لديك أي أسئلة:

- افتح [Discussion](https://github.com/taha-alqadasi/dua-azkari/discussions)
- افتح [Issue](https://github.com/taha-alqadasi/dua-azkari/issues)
- راسلنا عبر GitHub

</div>

---

## 🙏 شكراً لك!

<div dir="rtl">

شكراً لمساهمتك في **دعاء أذكاري**! كل مساهمة، صغيرة كانت أم كبيرة، تساعد في تحسين المشروع وخدمة المجتمع.

نحن نقدر وقتك وجهدك! 🌟

</div>

