import "./TextFormattingGuidelinesPage.css";
import { useContext } from "react";
import { useEffect } from "react";
import { Markdown } from "src/components/Markdown";
import { TitleContext } from "src/contexts/TitleContext";

const sections = [
  {
    title: "Headings",
    text: `# Heading size 1
## Heading size 2
### Heading size 3
`,
  },
  {
    title: "Text styles",
    text: `**Bold text**
_italicized text_
~Strikethrough text~
Text coloring
[p]Blue for Pickups[/p]
[s]Gold for Secrets[/s]
[t]Orange for Traps[/t]
[e]Red for Enemies[/e]
[o]Green for Objects of Interest or Interactibles[/o]
`,
  },
  {
    title: "Links",
    text: `[example website title](https://www.example.com)

![Lara wink image](https://i.imgur.com/ZD0KMrl.png)
`,
  },
  {
    title: "Blockquote",
    text: `> This is a quote in a block.

> Another quote...
>
> in one box with a linebreak
`,
  },
  {
    title: "Horizontal line",
    text: `Text before line.

---
Text after line.
`,
  },
  {
    title: "Lists",
    text: `- [x] Write the press release
- [ ] Update the website
- [ ] Contact the media

1. First item
2. Second item
3. Third item

- First item
- Second item
- Third item
`,
  },
  {
    title: "Tables",
    text: `| Level | Secrets | Enemies | Pickups |
| ----- | ----- | ----- | ----- |
| Level 1 | 5 | 23 | 28 |
| Level 2 | 2 | 33 | 14 |
| Level 3 | 3 | 8 | 19 |
`,
  },
  {
    title: "Footnotes",
    text: `Here's a sentence with a footnote. [^1]

[^1]: This is the footnote.
`,
  },
];

const TextFormattingGuidelinesPage = () => {
  const { setTitle } = useContext(TitleContext);

  useEffect(() => {
    setTitle("Text formatting guide");
  }, [setTitle]);

  return (
    <div className="TextFormattingGuidelinesPage">
      <h1>Text formatting guide</h1>
      <div className="TextFormattingGuidelinesPage--sections">
        {sections.map((section) => (
          <>
            <h2 className="TextFormattingGuidelinesPage--sectionHeader">
              {section.title}
            </h2>
            <article
              key={section.title}
              className="TextFormattingGuidelinesPage--section"
            >
              <div>
                <strong>Syntax</strong>
                <pre className="TextFormattingGuidelinesPage--code">
                  <code>{section.text}</code>
                </pre>
              </div>
              <div>
                <strong>Result</strong>
                <Markdown>{section.text}</Markdown>
              </div>
            </article>
          </>
        ))}
      </div>
    </div>
  );
};

export { TextFormattingGuidelinesPage };
