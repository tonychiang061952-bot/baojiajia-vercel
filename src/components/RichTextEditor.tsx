import { useRef, useMemo, useCallback, useState, useEffect } from 'react';
import ReactQuill, { Quill } from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
const isBrowser = typeof window !== 'undefined';

let StyledImage: any = null;

class ImageResizeModule {
  private quill: any;
  private overlay: HTMLDivElement | null = null;
  private image: HTMLImageElement | null = null;
  private dragData: { startX: number; startWidth: number; direction: 'left' | 'right' } | null = null;
  private container: HTMLElement;

  constructor(quill: any) {
    this.quill = quill;
    this.container = quill.root.parentElement || quill.root;

    this.handleImageClick = this.handleImageClick.bind(this);
    this.handleDocumentClick = this.handleDocumentClick.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.stopDragging = this.stopDragging.bind(this);

    this.quill.root.addEventListener('click', this.handleImageClick, false);
    document.addEventListener('click', this.handleDocumentClick, false);
  }

  handleImageClick(evt: MouseEvent) {
    const target = evt.target as HTMLElement;
    if (!target) return;

    const image = target.closest('img');
    if (image && this.quill.root.contains(image)) {
      evt.preventDefault();
      evt.stopPropagation();
      this.selectImage(image as HTMLImageElement);
    }
  }

  handleDocumentClick(evt: MouseEvent) {
    if (!this.overlay || !this.image) return;
    if (evt.target instanceof Node && this.overlay.contains(evt.target)) return;
    this.deselect();
  }

  selectImage(image: HTMLImageElement) {
    this.image = image;
    this.createOverlay();
    this.updateOverlay();
  }

  deselect() {
    this.image = null;
    this.removeOverlay();
    this.stopDragging();
  }

  createOverlay() {
    if (!this.overlay) {
      this.overlay = document.createElement('div');
      this.overlay.className = 'ql-image-resize-overlay';
      this.container.appendChild(this.overlay);

      ['left', 'right'].forEach((direction) => {
        const handle = document.createElement('span');
        handle.className = 'ql-image-resize-handle';
        handle.dataset.side = direction;
        handle.addEventListener('mousedown', (evt) => this.startDragging(evt, direction as 'left' | 'right'));
        this.overlay?.appendChild(handle);
      });
    }
  }

  removeOverlay() {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
  }

  updateOverlay() {
    if (!this.overlay || !this.image) return;
    const imageRect = this.image.getBoundingClientRect();
    const containerRect = this.container.getBoundingClientRect();

    const top = imageRect.top - containerRect.top + this.container.scrollTop;
    const left = imageRect.left - containerRect.left + this.container.scrollLeft;

    Object.assign(this.overlay.style, {
      top: `${top - 2}px`,
      left: `${left - 2}px`,
      width: `${imageRect.width + 4}px`,
      height: `${imageRect.height + 4}px`
    });

    const handles = this.overlay.querySelectorAll<HTMLSpanElement>('.ql-image-resize-handle');
    handles.forEach((handle) => {
      const side = handle.dataset.side;
      if (side === 'left') {
        Object.assign(handle.style, { left: '-6px', top: '50%', transform: 'translate(-50%, -50%)' });
      } else {
        Object.assign(handle.style, { right: '-6px', top: '50%', transform: 'translate(50%, -50%)' });
      }
    });
  }

  startDragging(evt: MouseEvent, direction: 'left' | 'right') {
    evt.preventDefault();
    evt.stopPropagation();
    if (!this.image) return;

    this.dragData = {
      startX: evt.clientX,
      startWidth: this.image.getBoundingClientRect().width,
      direction
    };

    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.stopDragging);
  }

  handleMouseMove(evt: MouseEvent) {
    if (!this.dragData || !this.image) return;
    const { startX, startWidth, direction } = this.dragData;
    const delta = evt.clientX - startX;
    const factor = direction === 'left' ? -1 : 1;
    const newWidth = Math.max(60, startWidth + factor * delta);
    this.image.style.width = `${newWidth}px`;
    this.image.style.height = 'auto';
    this.updateOverlay();
  }

  stopDragging() {
    if (!this.dragData) return;
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.stopDragging);
    this.dragData = null;
  }

  destroy() {
    this.deselect();
    this.quill.root.removeEventListener('click', this.handleImageClick);
    document.removeEventListener('click', this.handleDocumentClick);
  }
}

if (isBrowser && typeof Quill !== 'undefined') {
  const QuillWithImports = Quill as typeof Quill & { imports?: Record<string, any> };
  if (!StyledImage) {
    const BaseImage = QuillWithImports.import('formats/image');
    StyledImage = class extends BaseImage {
      static formats(domNode: HTMLElement) {
        const formats: Record<string, string> = {};
        if (domNode.getAttribute('alt')) {
          formats.alt = domNode.getAttribute('alt') as string;
        }
        if (domNode.style.width) {
          formats.width = domNode.style.width;
        }
        if (domNode.style.height) {
          formats.height = domNode.style.height;
        }
        return formats;
      }

      format(name: string, value: string) {
        if (name === 'width' || name === 'height') {
          if (value) {
            this.domNode.style[name as 'width' | 'height'] = value;
          } else {
            this.domNode.style[name as 'width' | 'height'] = '';
          }
        } else {
          super.format(name, value);
        }
      }
    };
  }
  if (!QuillWithImports.imports?.['modules/imageResizeSimple']) {
    QuillWithImports.register('modules/imageResizeSimple', ImageResizeModule);
  }
  const ImageBlot = QuillWithImports.imports?.['formats/image'];
  if (ImageBlot && ImageBlot !== StyledImage) {
    QuillWithImports.register(StyledImage, true);
  }

  // 分隔線 <hr>：Quill 預設不認得這個標籤，內容裡有 <hr> 時
  // 只要在視覺編輯器存一次檔就會被吃掉。註冊成 blot 之後才會保留。
  if (!QuillWithImports.imports?.['formats/divider']) {
    const BlockEmbed = QuillWithImports.import('blots/block/embed') as any;
    class DividerBlot extends BlockEmbed {}
    (DividerBlot as any).blotName = 'divider';
    (DividerBlot as any).tagName = 'hr';
    QuillWithImports.register(DividerBlot as any);
  }
}
import { uploadToCloudinary } from '../lib/cloudinary';

interface Props {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
}


/*
 * 表格：Quill 2 內建的表格只認 <td>、一格一行。進編輯器前先把 <th> 轉成 <td>、
 * 格內的 <br> 換成看得見的 ↵，存檔時再換回 <br>；標題列的底色改由網站樣式套在第一列。
 */
const CELL_BREAK = '↵';

function toEditorHtml(html: string): string {
  return html.replace(/<table\b[\s\S]*?<\/table>/gi, (table) =>
    table
      .replace(/<\/?thead\b[^>]*>/gi, '')
      .replace(/<th\b([^>]*)>/gi, '<td$1>')
      .replace(/<\/th>/gi, '</td>')
      .replace(/<td\b[^>]*>[\s\S]*?<\/td>/gi, (cell) => cell.replace(/<br\s*\/?>/gi, CELL_BREAK)),
  );
}

function fromEditorHtml(html: string): string {
  return html.split(CELL_BREAK).join('<br>');
}

// 編輯器仍然存不住的東西：<div>、合併儲存格、內嵌 iframe。有這些就直接開原始碼模式。
const UNSAFE_FOR_EDITOR = /<div\b|<iframe\b|\s(?:colspan|rowspan)\s*=/i;

export default function RichTextEditor({ value, onChange, placeholder }: Props) {
  const quillRef = useRef<ReactQuill>(null);
  // HTML 原始碼模式：直接編輯原始 HTML，Quill 不會介入正規化。
  const [sourceMode, setSourceMode] = useState(() => UNSAFE_FOR_EDITOR.test(value));
  const autoChecked = useRef(Boolean(value));
  // 文章內容常是非同步載入：第一次拿到內容時再判斷一次
  useEffect(() => {
    if (autoChecked.current || !value) return;
    autoChecked.current = true;
    if (UNSAFE_FOR_EDITOR.test(value)) setSourceMode(true);
  }, [value]);

  // 受控元件：編輯器吐出來的 HTML 換回 <br> 之後才交給外層；
  // 外層把同一份內容傳回來時沿用編輯器原本的版本，避免游標跳走。
  const lastEditorHtml = useRef<string | null>(null);
  const editorValue = useMemo(() => {
    const last = lastEditorHtml.current;
    return last !== null && fromEditorHtml(last) === value ? last : toEditorHtml(value);
  }, [value]);
  const handleEditorChange = useCallback(
    (html: string) => {
      lastEditorHtml.current = html;
      onChange(fromEditorHtml(html));
    },
    [onChange],
  );

  const table = (action: 'insert' | 'rowBelow' | 'colRight' | 'deleteRow' | 'deleteCol' | 'deleteTable') => {
    const quill = quillRef.current?.getEditor();
    const mod = quill?.getModule('table') as any;
    if (!quill || !mod) return;
    quill.focus();
    if (action === 'insert') mod.insertTable(3, 3);
    else if (action === 'rowBelow') mod.insertRowBelow();
    else if (action === 'colRight') mod.insertColumnRight();
    else if (action === 'deleteRow') mod.deleteRow();
    else if (action === 'deleteCol') mod.deleteColumn();
    else mod.deleteTable();
  };

  const imageHandler = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) {
        try {
          const url = await uploadToCloudinary(file);
          const quill = quillRef.current?.getEditor();
          if (quill) {
            const range = quill.getSelection(true);
            const insertIndex = range ? range.index : quill.getLength();
            quill.insertEmbed(insertIndex, 'image', url, 'user');
            quill.setSelection(insertIndex + 1, 0, 'silent');
          }
        } catch (error) {
          console.error('Image upload failed:', error);
          alert('圖片上傳失敗');
        }
      }
    };
  }, []);

  const modules = useMemo(() => {
    const base: any = {
      table: true,
      keyboard: {
        bindings: {
          // 覆蓋 Quill 預設：在表格格子裡按 Enter 就是格內換行（存檔時變成 <br>）
          'table enter': {
            key: 'Enter',
            shiftKey: null,
            format: ['table'],
            handler(this: any, range: { index: number }) {
              this.quill.insertText(range.index, CELL_BREAK, 'user');
              this.quill.setSelection(range.index + 1, 0, 'silent');
              return false;
            },
          },
        },
      },
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike', 'blockquote'],
          [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
          [{ color: [] }, { background: [] }],
          [{ align: [] }],
          ['link', 'image', 'video'],
          ['clean']
        ],
        handlers: {
          image: imageHandler
        }
      }
    };

    if (isBrowser) {
      base.imageResizeSimple = {};
    }

    return base;
  }, [imageHandler]);

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video', 'color', 'background', 'align',
    'width', 'height', 'divider',
    'table', 'table-row', 'table-body', 'table-container'
  ];

  if (sourceMode) {
    return (
      <div className="rich-text-editor">
        <div className="flex items-center justify-between gap-3 rounded-t-lg border border-b-0 border-gray-300 bg-amber-50 px-3 py-2">
          <p className="text-xs text-amber-800">
            HTML 原始碼模式。存檔後內容原封不動。
            {UNSAFE_FOR_EDITOR.test(value) ? (
              <strong className="font-semibold">這篇有編輯模式存不住的排版（div、合併儲存格或內嵌影片），所以自動開在這裡；切回編輯模式存檔會弄壞它們。</strong>
            ) : (
              <span>表格在編輯模式也改得動。</span>
            )}
          </p>
          <button
            type="button"
            onClick={() => setSourceMode(false)}
            className="shrink-0 rounded-md border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100"
          >
            切回編輯模式
          </button>
        </div>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          spellCheck={false}
          className="w-full min-h-[400px] rounded-b-lg border border-gray-300 bg-white p-3 font-mono text-[13px] leading-relaxed text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>
    );
  }

  return (
    <div className="rich-text-editor">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
        <div className="flex flex-wrap items-center gap-1 text-xs">
          <span className="mr-1 text-gray-500">表格：</span>
          {([
            ['insert', '插入 3×3'],
            ['rowBelow', '下方加一列'],
            ['colRight', '右邊加一欄'],
            ['deleteRow', '刪這一列'],
            ['deleteCol', '刪這一欄'],
            ['deleteTable', '刪整張表'],
          ] as const).map(([action, label]) => (
            <button
              key={action}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => table(action)}
              className="rounded-md border border-gray-300 bg-white px-2 py-1 text-gray-700 hover:bg-gray-50"
            >
              {label}
            </button>
          ))}
          <span className="ml-1 text-gray-400">格子裡按 Enter 會出現 ↵，就是格內換行</span>
        </div>
        <button
          type="button"
          onClick={() => setSourceMode(true)}
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
        >
          &lt;/&gt; HTML 原始碼
        </button>
      </div>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={editorValue}
        onChange={handleEditorChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="bg-white rounded-lg"
      />
      <style>{`
        .ql-toolbar.ql-snow {
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
          border-color: #d1d5db;
          background-color: #f9fafb;
        }
        .ql-container.ql-snow {
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
          border-color: #d1d5db;
          font-size: 1rem;
        }
        .ql-editor {
          min-height: 400px;
        }
        .ql-editor img {
          max-width: 100%;
          height: auto;
        }
        .ql-image-resize-overlay {
          position: absolute;
          border: 1px dashed #1F3A5F;
          box-sizing: border-box;
          pointer-events: none;
          z-index: 10;
        }
        .ql-image-resize-overlay::before {
          content: "";
          position: absolute;
          inset: -4px;
          border: 1px dashed rgba(15, 118, 110, 0.3);
        }
        .ql-image-resize-handle {
          position: absolute;
          width: 12px;
          height: 12px;
          background: #fff;
          border: 1px solid #1F3A5F;
          border-radius: 9999px;
          pointer-events: all;
        }
        .ql-image-resize-handle[data-side="left"] {
          cursor: ew-resize;
        }
        .ql-image-resize-handle[data-side="right"] {
          cursor: ew-resize;
        }
      `}</style>
    </div>
  );
}
