import styles from "./index.module.css";
import { findAndReplace } from "mdast-util-find-and-replace";
import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { YoutubeEmbed } from "src/components/common/YoutubeEmbed";
import { remarkTransformHeaders } from "src/components/markdown/MarkdownTOC";
import { parseYoutubeLink } from "src/utils/misc";
import { visit as _visit } from "unist-util-visit";

// A loosely-structured mdast/unist node. This module both reads standard
// nodes (text, paragraph) and synthesizes custom ones (e.g. "alignment"),
// so the shape is intentionally open rather than tied to @types/mdast.
interface MdNode {
  type: string;
  value?: string;
  children?: MdNode[];
  data?: Record<string, unknown>;
}

type Visitor = (
  node: MdNode,
  index: number | undefined,
  parent: MdNode | undefined,
) => number | void;

// unist-util-visit's overloaded generic signature makes tsc type-check of the
// two-argument visit(tree, visitor) form pathologically slow (minutes), so
// narrow it to a plain, non-generic signature to keep type-checking fast.
const visit = _visit as (tree: MdNode, visitor: Visitor) => void;

const textNode = (value: string): MdNode => ({ type: "text", value });

const remarkAlignment = () => {
  const filterEmpty = (root: MdNode[]): MdNode[] => {
    return root.filter((item) => !(item.type === "text" && !item.value));
  };

  const transformInline = (root: MdNode): boolean => {
    const regex =
      /^(?<prefix>.*?)\[center\](?<content>.*?)\[\/center\](?<suffix>.*)$/i;

    let middle: MdNode | null = null;
    let match: RegExpMatchArray | null = null;
    for (const node of root.children || []) {
      if (node.type !== "text") {
        continue;
      }
      if (!middle && (match = node.value?.match(regex) ?? null)) {
        middle = node;
        break;
      }
    }

    if (!middle || !match?.groups || !root.children) {
      return false;
    }
    const groups = match.groups;

    const newContent = filterEmpty([
      textNode(groups.prefix),
      {
        type: "alignment",
        children: [textNode(groups.content)],
        data: {
          hName: "div",
          hProperties: { class: styles.center },
        },
      },
      textNode(groups.suffix),
    ]);
    root.children.splice(root.children.indexOf(middle), 1, ...newContent);
    return true;
  };

  const transformBlock = (root: MdNode): boolean => {
    const startRegex = /^(?<prefix>.*?)\[center\](?<suffix>.*)$/i;
    const endRegex = /^(?<prefix>.*?)\[\/center\](?<suffix>.*)$/i;
    let startMatch: RegExpMatchArray | null = null;
    let endMatch: RegExpMatchArray | null = null;

    let startNode: MdNode | null = null;
    let endNode: MdNode | null = null;
    for (const node of root.children || []) {
      if (node.type !== "text") {
        continue;
      }
      if (!startNode && (startMatch = node.value?.match(startRegex) ?? null)) {
        startNode = node;
      }
      if (!endNode && (endMatch = node.value?.match(endRegex) ?? null)) {
        endNode = node;
      }
    }

    if (
      !startNode ||
      !endNode ||
      !startMatch?.groups ||
      !endMatch?.groups ||
      !root.children
    ) {
      return false;
    }
    const startGroups = startMatch.groups;
    const endGroups = endMatch.groups;

    const startIdx = root.children.indexOf(startNode);
    const endIdx = root.children.indexOf(endNode);
    const contentNodes = filterEmpty([
      textNode(startGroups.suffix),
      ...root.children.slice(startIdx + 1, endIdx),
      textNode(endGroups.prefix),
    ]);

    const newContent = filterEmpty([
      textNode(startGroups.prefix),
      contentNodes.length
        ? {
            type: "alignment",
            children: contentNodes,
            data: {
              hName: "div",
              hProperties: { class: styles.center },
            },
          }
        : textNode(""),
      textNode(endGroups.suffix),
    ]);

    if (startIdx === 0 && endIdx === root.children.length - 1) {
      Object.assign(root, {
        type: "alignment",
        children: newContent,
        data: {
          hName: "p",
          hProperties: { class: styles.center },
        },
      });
    } else {
      root.children.splice(startIdx, endIdx + 1 - startIdx, ...newContent);
    }

    return true;
  };

  return (tree: MdNode) => {
    visit(tree, (node) => {
      transformInline(node);
      transformBlock(node);
    });
  };
};

const remarkSqueezeParagraphs = () => {
  return (tree: MdNode) => {
    visit(tree, (node, index, parent) => {
      if (
        index !== undefined &&
        parent?.children &&
        (node.type === "paragraph" || node.type === "alignment") &&
        (node.children ?? []).every(
          (child) => child.type === "text" && /^\s*$/.test(child.value ?? ""),
        )
      ) {
        parent.children.splice(index, 1);
        return index;
      }
    });
  };
};

const remarkRemoveElements = (allowedTags: string[]) => {
  return () => {
    return (tree: MdNode) => {
      visit(tree, (node, index, parent) => {
        if (
          index !== undefined &&
          parent?.children &&
          allowedTags.some((tag) => node.type === tag)
        ) {
          parent.children.splice(index, 1);
          return index;
        }
      });
    };
  };
};

const remarkTRCustomColors = () => {
  const coloredTextRegex = /\[([pesto])\]([^\n[\]]*)\[\/\1\]/gi;
  const replaceColoredText = (
    $0: string,
    char: string,
    text: string,
  ): MdNode => {
    const className = {
      p: styles.pickup,
      e: styles.enemy,
      s: styles.secret,
      t: styles.trap,
      o: styles.object,
    }[char];
    return {
      type: "element",
      data: {
        hName: "span",
        hProperties: { class: `${styles.color} ${className}` },
        hChildren: [textNode(text)],
      },
    };
  };

  return (tree: MdNode) => {
    // mdast-util-find-and-replace is typed against @types/mdast's concrete
    // node unions; our open MdNode/replacement don't line up with them, so
    // cross the boundary with a cast rather than pulling in those types.
    findAndReplace(tree as Parameters<typeof findAndReplace>[0], [
      [coloredTextRegex, replaceColoredText as never],
    ]);
  };
};

type AnchorProps = React.ComponentPropsWithoutRef<"a">;

const transformLink = (
  link: AnchorProps,
  allowEmbeds: boolean | undefined,
): React.ReactElement | null => {
  const youtubeVideo = parseYoutubeLink(link.href ?? "");
  if (!youtubeVideo?.videoID && !youtubeVideo?.playlistID) {
    return <a href={link.href}>{link.children}</a>;
  } else if (!allowEmbeds) {
    return null;
  }
  return <YoutubeEmbed {...youtubeVideo} />;
};

interface MarkdownProps {
  allowColors?: boolean;
  allowEmbeds?: boolean;
  allowLines?: boolean;
  children: string;
}

const Markdown = ({
  allowEmbeds,
  allowLines,
  allowColors,
  children,
}: MarkdownProps) => {
  allowEmbeds ??= true;
  allowLines ??= true;
  allowColors ??= true;

  const rendered = useMemo(() => {
    const classNames: string[] = [
      styles.wrapper,
      allowColors ? styles.colors : styles.noColors,
      "ChildMarginClear",
    ];

    const plugins = [
      ...(allowEmbeds ? [] : [remarkRemoveElements(["image", "iframe"])]),
      ...(allowLines ? [] : [remarkRemoveElements(["thematicBreak"])]),
      remarkAlignment,
      remarkSqueezeParagraphs,
      remarkGfm,
      remarkBreaks,
      remarkTransformHeaders,
      remarkTRCustomColors,
    ];

    return (
      <div className={classNames.join(" ")}>
        <ReactMarkdown
          remarkPlugins={plugins}
          components={{ a: (link) => transformLink(link, allowEmbeds) }}
        >
          {children}
        </ReactMarkdown>
      </div>
    );
  }, [children, allowColors, allowEmbeds, allowLines]);

  return rendered;
};

export { Markdown };
