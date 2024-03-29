import styles from "./index.module.css";
import { Box } from "src/components/common/Box";
import { PlainLayout } from "src/components/layouts/PlainLayout";
import { Markdown } from "src/components/markdown/Markdown";
import { usePageMetadata } from "src/contexts/PageMetadataContext";

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

[p]Pickups[/p]
[s]Secrets[/s]
[t]Traps[/t]
[e]Enemies[/e]
[o]Objects of Interest or Interactibles[/o]
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
  usePageMetadata(() => ({ ready: true, title: "Text formatting guide" }), []);

  return (
    <PlainLayout header="Text formatting guide">
      {sections.map((section) => (
        <>
          <h2 className={styles.sectionHeader}>{section.title}</h2>
          <Box>
            <article key={section.title} className={styles.section}>
              <div className="ChildMarginClear">
                <h3 className={styles.exampleHeader}>Syntax</h3>
                <pre className={styles.code}>
                  <code>{section.text}</code>
                </pre>
              </div>
              <div className="ChildMarginClear">
                <h3 className={styles.exampleHeader}>Result</h3>
                <Markdown>{section.text}</Markdown>
              </div>
            </article>
          </Box>
        </>
      ))}
    </PlainLayout>
  );
};

export { TextFormattingGuidelinesPage };
