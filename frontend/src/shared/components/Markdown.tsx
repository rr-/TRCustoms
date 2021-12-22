import "./Markdown.css";
import ReactMarkdown from "react-markdown";

interface MarkdownProps {
  children: string;
}

function getYoutubeVideoID(url: string): string | null {
  var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  var match = url.match(regExp);
  return match && match[7].length === 11 ? match[7] : null;
}

const transformLink = (link) => {
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
  return (
    <ReactMarkdown components={{ a: transformLink }}>{children}</ReactMarkdown>
  );
};

export { Markdown };
