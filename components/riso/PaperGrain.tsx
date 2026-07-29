/**
 * Paper tooth. A single fixed, pointer-transparent layer so the noise never
 * repaints inside a scrolling container.
 */
export function PaperGrain() {
  return <div className="riso-grain" aria-hidden />;
}
