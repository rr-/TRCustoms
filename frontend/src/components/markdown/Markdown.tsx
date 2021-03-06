import "./Markdown.css";
import { findAndReplace } from "mdast-util-find-and-replace";
import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { remarkTransformHeaders } from "src/components/markdown/MarkdownTOC";
import { parseYoutubeLink } from "src/utils/misc";

const coloredTextRegex = /\[([pesto])\]([^\n[\]]*)\[\/\1\]/gi;

const remarkTRCustomColors = () => {
  const replaceColoredText = ($0: string, char: string, text: string): any => {
    let className = {
      p: "pickup",
      e: "enemy",
      s: "secret",
      t: "trap",
      o: "object",
    }[char];
    return {
      type: "element",
      data: {
        hName: "span",
        hProperties: { class: `Markdown--color ${className}` },
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
        className="Markdown--Embed--YouTube"
        src={`https://www.youtube.com/embed/${youtubeVideo.videoID}?autoplay=0&iv_load_policy=3&showinfo=0&rel=0&start=0&end=0&list=${youtubeVideo.playlistID}`}
      />
    );
  }
  if (youtubeVideo?.videoID) {
    return (
      <iframe
        title="YouTube video"
        className="Markdown--Embed--YouTube"
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
      <div className="Markdown ChildMarginClear">
        <ReactMarkdown
          remarkPlugins={[
            remarkGfm,
            remarkBreaks,
            remarkTransformHeaders,
            remarkTRCustomColors,
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
