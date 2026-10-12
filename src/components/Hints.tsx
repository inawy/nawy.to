export function Hints({ hasQuery }: { hasQuery: boolean }) {
  return (
    <footer className="hints" aria-label="اختصارات الكيبورد">
      <span><kbd>↑ ↓</kbd>للتنقل</span>
      <span><kbd>↵</kbd>للفتح</span>
      {hasQuery ? <span><kbd>Esc</kbd>للمسح</span> : <span><kbd>/</kbd>للكتابة</span>}
    </footer>
  );
}
