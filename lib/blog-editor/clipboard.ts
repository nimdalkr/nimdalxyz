type ClipboardItemLike = {
  getAsFile(): File | null;
  kind: string;
  type: string;
};

export type TextSelection = {
  start: number;
  end: number;
};

export function clipboardImageFiles(items: Iterable<ClipboardItemLike>) {
  return Array.from(items)
    .filter((item) => item.kind === "file" && item.type.startsWith("image/"))
    .map((item) => item.getAsFile())
    .filter((file): file is File => file !== null);
}

export function insertAtSelection(value: string, selection: TextSelection, insertion: string) {
  const start = Math.min(Math.max(Math.min(selection.start, selection.end), 0), value.length);
  const end = Math.min(Math.max(Math.max(selection.start, selection.end), 0), value.length);
  const before = value.slice(0, start);
  const after = value.slice(end);
  const prefix = before.length === 0 || before.endsWith("\n\n")
    ? ""
    : before.endsWith("\n")
      ? "\n"
      : "\n\n";
  const suffix = after.length === 0 || after.startsWith("\n\n")
    ? ""
    : after.startsWith("\n")
      ? "\n"
      : "\n\n";
  const inserted = `${prefix}${insertion}${suffix}`;

  return {
    value: `${before}${inserted}${after}`,
    caret: before.length + inserted.length
  };
}
