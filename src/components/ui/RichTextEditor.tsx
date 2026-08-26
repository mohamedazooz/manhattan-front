import { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Eraser,
  Code,
  Eye,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface RichTextEditorProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

export function RichTextEditor({
  label,
  value,
  onChange,
  placeholder = 'Write content here...',
  className,
  minHeight = '180px',
}: RichTextEditorProps) {
  const { t } = useTranslation();
  const editorRef = useRef<HTMLDivElement>(null);
  const [showCode, setShowCode] = useState(false);
  const [htmlValue, setHtmlValue] = useState(value || '');

  // Synchronize internal state with external value prop
  useEffect(() => {
    setHtmlValue(value || '');
    if (editorRef.current && editorRef.current.innerHTML !== (value || '')) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      setHtmlValue(content);
      onChange(content);
    }
  };

  const executeCommand = (command: string, arg?: string) => {
    if (showCode) return;
    document.execCommand(command, false, arg || undefined);
    if (editorRef.current) {
      editorRef.current.focus();
      handleInput();
    }
  };

  const handleAddLink = () => {
    if (showCode) return;
    const url = prompt('أدخل رابط الموقع (URL):', 'https://');
    if (url) {
      executeCommand('createLink', url);
    }
  };

  return (
    <div className={cn('w-full flex flex-col gap-1.5', className)}>
      {label && <label className="text-sm font-semibold text-neutral-dark">{label}</label>}
      <div className="border border-neutral-medium/30 rounded-lg overflow-hidden bg-white shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary focus-within:border-primary">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 p-2 bg-neutral-light/60 border-b border-neutral-medium/20 text-neutral-dark select-none">
          <button
            type="button"
            title="غليظ (Bold)"
            onClick={() => executeCommand('bold')}
            className="p-1.5 rounded hover:bg-white hover:shadow-xs transition-all text-neutral-dark"
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="مائل (Italic)"
            onClick={() => executeCommand('italic')}
            className="p-1.5 rounded hover:bg-white hover:shadow-xs transition-all text-neutral-dark"
          >
            <Italic className="h-4 w-4" />
          </button>

          <div className="h-4 w-[1px] bg-neutral-medium/30 mx-1" />

          <button
            type="button"
            title="عنوان رئيسي (Heading 2)"
            onClick={() => executeCommand('formatBlock', '<h2>')}
            className="p-1.5 rounded hover:bg-white hover:shadow-xs transition-all text-neutral-dark"
          >
            <Heading2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="عنوان فرعي (Heading 3)"
            onClick={() => executeCommand('formatBlock', '<h3>')}
            className="p-1.5 rounded hover:bg-white hover:shadow-xs transition-all text-neutral-dark"
          >
            <Heading3 className="h-4 w-4" />
          </button>

          <div className="h-4 w-[1px] bg-neutral-medium/30 mx-1" />

          <button
            type="button"
            title="قائمة نقطية (Bullet List)"
            onClick={() => executeCommand('insertUnorderedList')}
            className="p-1.5 rounded hover:bg-white hover:shadow-xs transition-all text-neutral-dark"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="قائمة رقمية (Numbered List)"
            onClick={() => executeCommand('insertOrderedList')}
            className="p-1.5 rounded hover:bg-white hover:shadow-xs transition-all text-neutral-dark"
          >
            <ListOrdered className="h-4 w-4" />
          </button>

          <div className="h-4 w-[1px] bg-neutral-medium/30 mx-1" />

          <button
            type="button"
            title="إضافة رابط (Add Link)"
            onClick={handleAddLink}
            className="p-1.5 rounded hover:bg-white hover:shadow-xs transition-all text-neutral-dark"
          >
            <LinkIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="إزالة التنسيق (Clear Formatting)"
            onClick={() => executeCommand('removeFormat')}
            className="p-1.5 rounded hover:bg-white hover:shadow-xs transition-all text-neutral-dark"
          >
            <Eraser className="h-4 w-4" />
          </button>

          <div className="flex-1" />

          {/* Code / Visual Toggle */}
          <button
            type="button"
            title={showCode ? 'الرؤية المرئية' : 'عرض الكود التلقائي'}
            onClick={() => setShowCode(!showCode)}
            className={cn(
              'flex items-center gap-1.5 px-2 py-1 text-xs rounded transition-all font-medium',
              showCode ? 'bg-primary text-white' : 'bg-neutral-light hover:bg-white text-neutral-dark border'
            )}
          >
            {showCode ? (
              <>
                <Eye className="h-3.5 w-3.5" />
                <span>{t('common.visualPreview', 'معاينة مرئية')}</span>
              </>
            ) : (
              <>
                <Code className="h-3.5 w-3.5" />
                <span>{t('common.codeOptional', 'كود (اختياري)')}</span>
              </>
            )}
          </button>
        </div>

        {/* Editor Area */}
        {showCode ? (
          <textarea
            value={htmlValue}
            onChange={(e) => {
              setHtmlValue(e.target.value);
              onChange(e.target.value);
            }}
            placeholder={placeholder}
            className="w-full p-3 font-mono text-xs focus:outline-none bg-neutral-900 text-green-400 leading-relaxed resize-y"
            style={{ minHeight }}
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onBlur={handleInput}
            data-placeholder={placeholder}
            style={{ minHeight }}
            className="p-3 outline-none prose max-w-none text-neutral-dark leading-relaxed overflow-y-auto focus:bg-primary/5 transition-colors"
          />
        )}
      </div>
    </div>
  );
}
