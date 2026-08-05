import { Button } from '../../components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center space-y-6">
        <p className="text-6xl font-black text-primary/20">404</p>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          الصفحة غير موجودة
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          الرابط الذي طلبته غير متاح أو تم نقله. تحقق من العنوان أو ارجع للصفحة الرئيسية.
        </p>
        <Button variant="gold" to="/">
          العودة للصفحة الرئيسية
        </Button>
      </div>
    </div>
  );
}
