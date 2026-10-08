/** The second line is visual only, so the action keeps one accessible name. */
export function ButtonLabel({ children }: { children: string }) {
  return <span className="button-label">
    <span className="button-label-line">{children}</span>
    <span className="button-label-line button-label-copy" aria-hidden="true">{children}</span>
  </span>;
}
