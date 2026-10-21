type MdNode = {
  type: string;
  value?: string;
  depth?: number;
  children?: MdNode[];
  data?: { hName?: string; hProperties?: Record<string, string> };
};

/**
 * Texte lisible d'un nœud Markdown, titres inclus.
 * Sert à reconnaître exactement « À retenir », accents compris.
 */
function textOf(node: MdNode): string {
  if (node.type === 'text' || node.type === 'inlineCode') return node.value ?? '';
  return (node.children ?? []).map(textOf).join('');
}

/**
 * Transforme la section « À retenir » en encadré.
 * Un autre titre reste un titre ordinaire. Sans cette section, l'arbre ne change pas.
 */
export function remarkRetenir() {
  return (tree: MdNode) => {
    const children = tree.children;
    if (!children) return;
    const start = children.findIndex(
      (node) => node.type === 'heading' && textOf(node).trim() === 'À retenir',
    );
    if (start === -1) return;
    let end = children.findIndex((node, index) => index > start && node.type === 'heading');
    if (end === -1) end = children.length;
    const callout: MdNode = {
      type: 'blockquote',
      data: {
        hName: 'aside',
        hProperties: { class: 'retenir' },
      },
      children: children.slice(start, end),
    };
    children.splice(start, end - start, callout);
  };
}
