import "./Markdown.css";
import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getYoutubeVideoID } from "src/utils";

interface MarkdownProps {
  children: string;
}

const transformLink = (link: any): any => {
  let embedID = getYoutubeVideoID(link.href);
  if (embedID) {
    return (
      <iframe
        title="YouTube video"
        className="Markdown--Embed--YouTube"
        src={`https://www.youtube.com/embed/${embedID}?autoplay=0&iv_load_policy=3&showinfo=0&rel=0&start=0&end=0`}
      ></iframe>
    );
  }
  return <a href={link.href}>{link.children}</a>;
};

const Markdown = ({ children }: MarkdownProps) => {
  const rendered = useMemo(
    () => (
      <div className="Markdown">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
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