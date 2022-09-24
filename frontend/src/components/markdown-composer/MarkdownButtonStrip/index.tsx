import styles from "./index.module.css";
import { MarkdownHeaderButton } from "src/components/markdown-composer/MarkdownButtons";
import { MarkdownBoldButton } from "src/components/markdown-composer/MarkdownButtons";
import { MarkdownItalicButton } from "src/components/markdown-composer/MarkdownButtons";
import { MarkdownStrikeThroughButton } from "src/components/markdown-composer/MarkdownButtons";
import { MarkdownQuoteButton } from "src/components/markdown-composer/MarkdownButtons";
import { MarkdownCodeButton } from "src/components/markdown-composer/MarkdownButtons";
import { MarkdownLinkButton } from "src/components/markdown-composer/MarkdownButtons";
import { MarkdownImageButton } from "src/components/markdown-composer/MarkdownButtons";
import { MarkdownUnorderedListButton } from "src/components/markdown-composer/MarkdownButtons";
import { MarkdownOrderedListButton } from "src/components/markdown-composer/MarkdownButtons";
import { MarkdownColorSecretButton } from "src/components/markdown-composer/MarkdownButtons";
import { MarkdownColorPickupButton } from "src/components/markdown-composer/MarkdownButtons";
import { MarkdownColorObjectButton } from "src/components/markdown-composer/MarkdownButtons";
import { MarkdownColorEnemyButton } from "src/components/markdown-composer/MarkdownButtons";
import { MarkdownColorTrapButton } from "src/components/markdown-composer/MarkdownButtons";
import { MarkdownHelpButton } from "src/components/markdown-composer/MarkdownButtons";

interface MarkdownButtonStripProps {
  textarea: HTMLTextAreaElement | null;
}

const MarkdownButtonStrip = ({ textarea }: MarkdownButtonStripProps) => {
  const buttonProps = { textarea };

  return (
    <div className={styles.strip}>
      <div className={styles.group}>
        <MarkdownHeaderButton {...buttonProps} />
        <MarkdownBoldButton {...buttonProps} />
        <MarkdownItalicButton {...buttonProps} />
        <MarkdownStrikeThroughButton {...buttonProps} />
      </div>

      <div className={styles.group}>
        <MarkdownQuoteButton {...buttonProps} />
        <MarkdownCodeButton {...buttonProps} />
      </div>

      <div className={styles.group}>
        <MarkdownUnorderedListButton {...buttonProps} />
        <MarkdownOrderedListButton {...buttonProps} />
      </div>

      <div className={styles.group}>
        <MarkdownLinkButton {...buttonProps} />
        <MarkdownImageButton {...buttonProps} />
      </div>

      <div className={styles.group}>
        <MarkdownColorSecretButton {...buttonProps} />
        <MarkdownColorPickupButton {...buttonProps} />
        <MarkdownColorObjectButton {...buttonProps} />
        <MarkdownColorEnemyButton {...buttonProps} />
        <MarkdownColorTrapButton {...buttonProps} />
      </div>

      <div className={styles.group}>
        <MarkdownHelpButton />
      </div>
    </div>
  );
};

export { MarkdownButtonStrip };
