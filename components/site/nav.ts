// Primary navigation — single source shared by Header, Footer and the
// mobile sheet. [label, href]. Interior routes are built in later batches;
// in Batch 1 only "/" exists, so these may 404 until those pages land.
export const NAV: [string, string][] = [
  ["Products", "/products"],
  ["Systems", "/systems"],
  ["Colors", "/colors"],
  ["Industries", "/industries"],
  ["Resources", "/resources"],
  ["About", "/about"],
];
