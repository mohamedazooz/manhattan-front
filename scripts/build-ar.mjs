import fs from 'fs';
import path from 'path';

const root = path.resolve('src/i18n');
const en = JSON.parse(fs.readFileSync(path.join(root, 'en.json'), 'utf8'));

// Translation dictionary: English source string -> Arabic.
// Untranslated strings fall back to the English value (safe, no broken UI).
const dict = {
  "Manhattan Language School": "مدرسة منهاتن للغات",
  "Manhattan Language School (KG - Primary - Preparatory)": "مدرسة منهاتن للغات (روضة - ابتدائي - إعدادي)",
  "Toggle theme": "تبديل السمة",
  "Dark mode": "الوضع الداكن",
  "Light mode": "الوضع الفاتح",
  "Home": "الرئيسية",
  "About Us": "من نحن",
  "Academics": "الأكاديميات",
  "Admissions": "القبول",
  "Student Life": "الحياة الطلابية",
  "Gallery": "المعرض",
  "Parents": "أولياء الأمور",
  "News": "الأخبار",
  "Contact": "اتصل بنا",
  "ENROLL NOW": "سجّل الآن",
  "Careers": "الوظائف",
  "Apply as Student": "تقديم كطالب",
  "Apply as Teacher": "تقديم كمعلم",
  "Search": "بحث",
  "Login": "تسجيل الدخول",
  "Parent Portal": "بوابة ولي الأمر",
  "Applicant Portal": "بوابة المتقدم",
  "Admin": "الإدارة",
  "Dashboard": "لوحة التحكم",
  "DISCOVER MORE": "اكتشف المزيد",
  "OUR ACADEMIC PROGRAMS": "برامجنا الأكاديمية"
};

function tr(s) {
  if (typeof s !== 'string') return s;
  return dict[s] !== undefined ? dict[s] : s;
}

function deep(obj) {
  if (Array.isArray(obj)) return obj.map(deep);
  if (obj && typeof obj === 'object') {
    const out = {};
    for (const k of Object.keys(obj)) out[k] = deep(obj[k]);
    return out;
  }
  return tr(obj);
}

const ar = deep(en);
fs.writeFileSync(path.join(root, 'ar.json'), JSON.stringify(ar, null, 2), 'utf8');
console.log('ar.json generated. Keys translated where dictionary provided; rest fall back to English.');
