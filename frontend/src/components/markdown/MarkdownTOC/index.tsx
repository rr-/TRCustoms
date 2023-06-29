import "./index.css";
import Slugger from "github-slugger";
import { all } from "mdast-util-to-hast";
import { toString } from "mdast-util-to-string";
import { toc } from "mdast-util-toc";
import ReactMarkdown from "react-markdown";
import { visit } from "unist-util-visit";

const slugs = new Slugger();

const remarkTransformHeaders = () => {
  slugs.reset();
  return (tree: any) => {
    visit(tree, "heading", (node: any) => {
      const slug = slugs.slug(toString(node));
      node.data = {
        hProperties: { id: slug },
      };
    });
  };
};

const remarkTOC = () => {
  return (tree: any) => {
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

    const tocMarkdownAST = {
      ...tree,
      children: [],
    };

    for (let node of tree.children) {
      if (node.type === "heading" && node.depth > prefs.fromHeading - 1) {
        tocMarkdownAST.children.push(node);
      }
    }

    if (!tocMarkdownAST.children.length) {
      tree.children = [];
      return;
    }

    const result = toc(tocMarkdownAST, {
      maxDepth: prefs.toHeading,
      tight: prefs.tight,
      ordered: prefs.ordered,
      skip: "",
    });

    tree.children = [{ type: "toc", children: [result.map] }];
  };
};

const handlerTOC = (h: any, node: any) => {
  return h(
    node,
    "div",
    { class: "MarkdownTOC ChildMarginClear" },
    h.wrap(all(h, node), true)
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
