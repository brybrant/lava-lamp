export const createElement = <K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  attributes?: Partial<HTMLElementTagNameMap[K]>,
): HTMLElementTagNameMap[K] => {
  return Object.assign(document.createElement(tagName), attributes);
};

export const append = <T extends Node = Node>(parent: T, children: Node[]) => {
  for (const child of children) parent.appendChild(child);
  return parent;
};

export const createSVG = (path: string) => {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="${path}"/></svg>`;
};
