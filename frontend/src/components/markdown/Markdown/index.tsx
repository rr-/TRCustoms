import styles from "./index.module.css";
import { findAndReplace } from "mdast-util-find-and-replace";
import { toHast } from "mdast-util-to-hast";
import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { remarkTransformHeaders } from "src/components/markdown/MarkdownTOC";
import { parseYoutubeLink } from "src/utils/misc";

const remarkAlignment = () => {
  const filterEmpty = (root: any) => {
    return root.filter((item: any) => !(item.type === "text" && !item.value));
  };

  const transformInline = (root: any) => {
    const regex = /^(?<prefix>.*?)\[center\](?<content>.*?)\[\/center\](?<suffix>.*)$/i;

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
        data: {
          hName: "div",
          hProperties: { class: styles.center },
          hChildren: [{ type: "text", value: match.groups.content }],
        },
      },
      { type: "text", value: match.groups.suffix },
    ]);
    root.children.splice(root.children.indexOf(middle), 1, ...newContent);
    return true;
  };

  const transformBlock = (root: any) => {
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
    const content: any = filterEmpty([
      { type: "text", value: startMatch.groups.suffix },
      ...root.children.slice(startIdx + 1, endIdx),
      { type: "text", value: endMatch.groups.prefix },
    ]);
    const contentHast = content.map(toHast);

    const newContent: any = filterEmpty([
      { type: "text", value: startMatch.groups.prefix },
      {
        type: "alignment",
        value: "",
        data: {
          hName: "div",
          hProperties: { class: styles.center },
          hChildren: contentHast,
        },
      },
      { type: "text", value: endMatch.groups.suffix },
    ]);

    if (startIdx === 0 && endIdx === root.children.length - 1) {
      Object.assign(root, {
        type: "alignment",
        value: "",
        data: {
          hName: "p",
          hProperties: { class: styles.center },
          hChildren: newContent.map(toHast),
        },
      });
    } else {
      root.children.splice(startIdx, endIdx + 1 - startIdx, ...newContent);
    }

    return true;
  };

  const visit = (root: any) => {
    transformInline(root);
    transformBlock(root);
    for (let node of root.children || []) {
      visit(node);
    }
    return root;
  };

  return (tree: any) => {
    return visit(tree);
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
  let youtubeVideo = parseYoutubeLink(link.href);
  if (youtubeVideo?.playlistID) {
    return (
      <iframe
        title="YouTube video"
        className={styles.embedYoutube}
        src={`https://www.youtube.com/embed/${youtubeVideo.videoID}?autoplay=0&iv_load_policy=3&showinfo=0&rel=0&start=0&end=0&list=${youtubeVideo.playlistID}`}
      />
    );
  }
  if (youtubeVideo?.videoID) {
    return (
      <iframe
        title="YouTube video"
        className={styles.embedYoutube}
        src={`https://www.youtube.com/embed/${youtubeVideo.videoID}?autoplay=0&iv_load_policy=3&showinfo=0&rel=0&start=0&end=0`}
      />
    );
  }
  return <a href={link.href}>{link.children}</a>;
};

interface MarkdownProps {
  children: string;
}

const Markdown = ({ children }: MarkdownProps) => {
  const rendered = useMemo(
    () => (
      <div className={`${styles.wrapper} ChildMarginClear`}>
        <ReactMarkdown
          remarkPlugins={[
            remarkGfm,
            remarkBreaks,
            remarkTransformHeaders,
            remarkTRCustomColors,
            remarkAlignment,
          ]}
          components={{ a: transformLink }}
        >
          {children}
        </ReactMarkdown>
      </div>
    ),
    [children]
  );

  return rendered;
};

export { Markdown };
