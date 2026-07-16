import "./index.css";
import Slugger from "github-slugger";
import { all } from "mdast-util-to-hast";
import type { Handler } from "mdast-util-to-hast";
import { toString } from "mdast-util-to-string";
import { toc } from "mdast-util-toc";
import ReactMarkdown from "react-markdown";
import { visit } from "unist-util-visit";

// A loosely-structured mdast node; this module reads headings and synthesizes
// a custom "toc" node, so it stays open rather than tied to @types/mdast.
interface MdNode {
  type: string;
  depth?: number;
  data?: Record<string, unknown>;
  children?: MdNode[];
}

const slugs = new Slugger();

const remarkTransformHeaders = () => {
  slugs.reset();
  return (tree: MdNode) => {
    visit(tree, "heading", (node: MdNode) => {
      const slug = slugs.slug(toString(node));
      node.data = {
        hProperties: { id: slug },
      };
    });
  };
};

const remarkTOC = () => {
  return (tree: MdNode) => {
    const prefs: {
      tight: boolean;
      fromHeading: 1 | 2 | 3 | 4 | 5 | 6;
      toHeading: 1 | 2 | 3 | 4 | 5 | 6;
      ordered: boolean;
    } = {
      tight: false,
      fromHeading: 1,
      toHeading: 6,
      ordered: false,
    };

    const tocMarkdownAST: MdNode = {
      ...tree,
      children: [],
    };

    for (const node of tree.children ?? []) {
      if (
        node.type === "heading" &&
        (node.depth ?? 0) > prefs.fromHeading - 1
      ) {
        tocMarkdownAST.children?.push(node);
      }
    }

    if (!tocMarkdownAST.children?.length) {
      tree.children = [];
      return;
    }

    const result = toc(tocMarkdownAST as Parameters<typeof toc>[0], {
      maxDepth: prefs.toHeading,
      tight: prefs.tight,
      ordered: prefs.ordered,
      skip: "",
    });

    tree.children = [{ type: "toc", children: [result.map as MdNode] }];
  };
};

const handlerTOC: Handler = (h, node) => {
  return h(
    node,
    "div",
    { class: "MarkdownTOC ChildMarginClear" },
    h.wrap(all(h, node), true),
  );
};

interface MarkdownTOCProps {
  children: string;
}

const MarkdownTOC = ({ children }: MarkdownTOCProps) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkTransformHeaders, remarkTOC]}
      remarkRehypeOptions={{ handlers: { toc: handlerTOC } }}
    >
      {children}
    </ReactMarkdown>
  );
};

export { remarkTransformHeaders, MarkdownTOC };
