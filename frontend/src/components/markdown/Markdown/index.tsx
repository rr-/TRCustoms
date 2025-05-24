import styles from "./index.module.css";
import type { Element, Node } from "hast";
import { findAndReplace } from "mdast-util-find-and-replace";
import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { YoutubeEmbed } from "src/components/common/YoutubeEmbed";
import { remarkTransformHeaders } from "src/components/markdown/MarkdownTOC";
import { parseYoutubeLink } from "src/utils/misc";
import { visit } from "unist-util-visit";

const remarkAlignment = () => {
  const filterEmpty = (root: any) => {
    return root.filter((item: any) => !(item.type === "text" && !item.value));
  };

  const transformInline = (root: any) => {
    const regex =
      /^(?<prefix>.*?)\[center\](?<content>.*?)\[\/center\](?<suffix>.*)$/i;

    let middle = null;
    let match = null;
    for (let node of root.children || []) {
      if (node.type !== "text") {
        continue;
      }
      if (!middle && (match = node.value.match(regex))) {
        middle = node;
        break;
      }
    }

    if (!middle) {
      return false;
    }

    const newContent = filterEmpty([
      { type: "text", value: match.groups.prefix },
      {
        type: "alignment",
        children: [{ type: "text", value: match.groups.content }],
        data: {
          hName: "div",
          hProperties: { class: styles.center },
        },
      },
      { type: "text", value: match.groups.suffix },
    ]);
    root.children.splice(root.children.indexOf(middle), 1, ...newContent);
    return true;
  };

  const transformBlock = (root: any, index) => {
    const startRegex = /^(?<prefix>.*?)\[center\](?<suffix>.*)$/i;
    const endRegex = /^(?<prefix>.*?)\[\/center\](?<suffix>.*)$/i;
    let startMatch = null;
    let endMatch = null;

    let startNode = null;
    let endNode = null;
    for (let node of root.children || []) {
      if (node.type !== "text") {
        continue;
      }
      if (!startNode && (startMatch = node.value.match(startRegex))) {
        startNode = node;
      }
      if (!endNode && (endMatch = node.value.match(endRegex))) {
        endNode = node;
      }
    }

    if (!startNode || !endNode || !startMatch || !endMatch) {
      return false;
    }

    const startIdx = root.children.indexOf(startNode);
    const endIdx = root.children.indexOf(endNode);
    const contentNodes: any = filterEmpty([
      { type: "text", value: startMatch.groups.suffix },
      ...root.children.slice(startIdx + 1, endIdx),
      { type: "text", value: endMatch.groups.prefix },
    ]);

    const newContent: any = filterEmpty([
      { type: "text", value: startMatch.groups.prefix },
      contentNodes.length
        ? {
            type: "alignment",
            children: contentNodes,
            data: {
              hName: "div",
              hProperties: { class: styles.center },
            },
          }
        : { type: "text", value: "" },
      { type: "text", value: endMatch.groups.suffix },
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

  return (tree: any) => {
    visit(tree, (node: Element, index: number | undefined, parent: Node) => {
      transformInline(node);
      transformBlock(node);
    });
  };
};

const remarkSqueezeParagraphs = () => {
  return (tree: any) => {
    visit(tree, (node: Element, index: number | undefined, parent: Node) => {
      if (
        index !== undefined &&
        parent &&
        (node.type === "paragraph" || node.type === "alignment") &&
        node.children.every(function (child) {
          return child.type === "text" && /^\s*$/.test(child.value);
        })
      ) {
        parent.children.splice(index, 1);
        return index;
      }
    });
  };
};

const remarkRemoveElements = (allowedTags: string[]) => {
  return () => {
    return (tree: any) => {
      visit(tree, (node: Element, index: number | undefined, parent: Node) => {
        if (
          index !== undefined &&
          parent &&
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
  const replaceColoredText = ($0: string, char: string, text: string): any => {
    let className = {
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
        hChildren: [{ type: "text", value: text }],
      },
    };
  };

  return (tree: any) => {
    findAndReplace(tree, [[coloredTextRegex, replaceColoredText]]);
  };
};

const transformLink = (link: any): any => {
  const youtubeVideo = parseYoutubeLink(link.href);
  if (youtubeVideo?.videoID || youtubeVideo?.playlistID) {
    return <YoutubeEmbed {...youtubeVideo} />;
  }
  return <a href={link.href}>{link.children}</a>;
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
          components={{ a: transformLink }}
        >
          {children}
        </ReactMarkdown>
      </div>
    );
  }, [children, allowColors]);

  return rendered;
};

export { Markdown };
