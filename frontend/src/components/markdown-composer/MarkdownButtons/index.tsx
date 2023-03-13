import styles from "./index.module.css";
import { useCallback } from "react";
import { Link } from "src/components/common/Link";
import { IconHelp } from "src/components/icons";
import { IconMarkdownCode } from "src/components/icons";
import { IconMarkdownAlignCenter } from "src/components/icons";
import { IconMarkdownStrikeThrough } from "src/components/icons";
import { IconMarkdownQuote } from "src/components/icons";
import { IconMarkdownUnorderedList } from "src/components/icons";
import { IconMarkdownOrderedList } from "src/components/icons";
import { IconMarkdownLink } from "src/components/icons";
import { IconMarkdownImage } from "src/components/icons";
import { IconMarkdownBold } from "src/components/icons";
import { IconMarkdownHeader } from "src/components/icons";
import { IconMarkdownItalic } from "src/components/icons";
import { IconMarkdownColorSecret } from "src/components/icons";
import { IconMarkdownColorPickup } from "src/components/icons";
import { IconMarkdownColorObject } from "src/components/icons";
import { IconMarkdownColorEnemy } from "src/components/icons";
import { IconMarkdownColorTrap } from "src/components/icons";
import { applyStyle } from "src/components/markdown-composer/MarkdownStyle";
import type { MarkdownInputStyle } from "src/components/markdown-composer/MarkdownStyle";

interface MarkdownBaseButtonProps {
  textarea: HTMLTextAreaElement | null;
  tooltip: string;
  icon: React.ReactElement;
  style: MarkdownInputStyle;
}

const MarkdownBaseButton = ({
  icon,
  tooltip,
  textarea,
  style,
}: MarkdownBaseButtonProps) => {
  const handleClick = useCallback(() => {
    if (!textarea) {
      return;
    }
    applyStyle(textarea, style);
  }, [textarea, style]);

  return (
    <Link
      className={styles.button}
      onClick={handleClick}
      tooltip={tooltip}
      icon={icon}
    />
  );
};

interface MarkdownButtonProps {
  textarea: HTMLTextAreaElement | null;
}

const MarkdownHeaderButton = ({ ...props }: MarkdownButtonProps) => {
  return (
    <MarkdownBaseButton
      icon={<IconMarkdownHeader />}
      tooltip="Add heading text"
      style={{ prefix: "###" }}
      {...props}
    />
  );
};

const MarkdownBoldButton = ({ ...props }: MarkdownButtonProps) => {
  return (
    <MarkdownBaseButton
      icon={<IconMarkdownBold />}
      tooltip="Add bold text"
      style={{ prefix: "**", suffix: "**" }}
      {...props}
    />
  );
};

const MarkdownItalicButton = ({ ...props }: MarkdownButtonProps) => {
  return (
    <MarkdownBaseButton
      icon={<IconMarkdownItalic />}
      tooltip="Add italic text"
      style={{ prefix: "_", suffix: "_", trimFirst: true }}
      {...props}
    />
  );
};

const MarkdownStrikeThroughButton = ({ ...props }: MarkdownButtonProps) => {
  return (
    <MarkdownBaseButton
      icon={<IconMarkdownStrikeThrough />}
      tooltip="Add striked-through text"
      style={{ prefix: "~~", suffix: "~~" }}
      {...props}
    />
  );
};

const MarkdownQuoteButton = ({ ...props }: MarkdownButtonProps) => {
  return (
    <MarkdownBaseButton
      icon={<IconMarkdownQuote />}
      tooltip="Add a quote text"
      style={{ prefix: "> ", multiline: true, surroundWithNewlines: true }}
      {...props}
    />
  );
};

const MarkdownCodeButton = ({ ...props }: MarkdownButtonProps) => {
  return (
    <MarkdownBaseButton
      icon={<IconMarkdownCode />}
      tooltip="Add code"
      style={{
        prefix: "`",
        suffix: "`",
        blockPrefix: "```",
        blockSuffix: "```",
      }}
      {...props}
    />
  );
};

const MarkdownLinkButton = ({ ...props }: MarkdownButtonProps) => {
  return (
    <MarkdownBaseButton
      icon={<IconMarkdownLink />}
      tooltip="Add a link"
      style={{
        prefix: "[",
        suffix: "](url)",
        replaceNext: "url",
        scanFor: "https?://",
      }}
      {...props}
    />
  );
};

const MarkdownImageButton = ({ ...props }: MarkdownButtonProps) => {
  return (
    <MarkdownBaseButton
      icon={<IconMarkdownImage />}
      tooltip="Add an image"
      style={{
        prefix: "![",
        suffix: "](url)",
        replaceNext: "url",
        scanFor: "https?://",
      }}
      {...props}
    />
  );
};

const MarkdownUnorderedListButton = ({ ...props }: MarkdownButtonProps) => {
  return (
    <MarkdownBaseButton
      icon={<IconMarkdownUnorderedList />}
      tooltip="Add a bulleted list"
      style={{ prefix: "- ", multiline: true, unorderedList: true }}
      {...props}
    />
  );
};

const MarkdownOrderedListButton = ({ ...props }: MarkdownButtonProps) => {
  return (
    <MarkdownBaseButton
      icon={<IconMarkdownOrderedList />}
      tooltip="Add a bulleted list"
      style={{ prefix: "1. ", multiline: true, orderedList: true }}
      {...props}
    />
  );
};

const MarkdownAlignCenterButton = ({ ...props }: MarkdownButtonProps) => {
  return (
    <MarkdownBaseButton
      icon={<IconMarkdownAlignCenter />}
      tooltip="Align to center"
      style={{
        prefix: "[center]",
        suffix: "[/center]",
      }}
      {...props}
    />
  );
};

const MarkdownColorSecretButton = ({ ...props }: MarkdownButtonProps) => {
  return (
    <MarkdownBaseButton
      icon={<IconMarkdownColorSecret />}
      tooltip="Add a secret"
      style={{
        prefix: "[s]",
        suffix: "[/s]",
      }}
      {...props}
    />
  );
};

const MarkdownColorPickupButton = ({ ...props }: MarkdownButtonProps) => {
  return (
    <MarkdownBaseButton
      icon={<IconMarkdownColorPickup />}
      tooltip="Add a pickup"
      style={{
        prefix: "[p]",
        suffix: "[/p]",
      }}
      {...props}
    />
  );
};

const MarkdownColorObjectButton = ({ ...props }: MarkdownButtonProps) => {
  return (
    <MarkdownBaseButton
      icon={<IconMarkdownColorObject />}
      tooltip="Add an interactible"
      style={{
        prefix: "[o]",
        suffix: "[/o]",
      }}
      {...props}
    />
  );
};

const MarkdownColorEnemyButton = ({ ...props }: MarkdownButtonProps) => {
  return (
    <MarkdownBaseButton
      icon={<IconMarkdownColorEnemy />}
      tooltip="Add an enemy"
      style={{
        prefix: "[e]",
        suffix: "[/e]",
      }}
      {...props}
    />
  );
};

const MarkdownColorTrapButton = ({ ...props }: MarkdownButtonProps) => {
  return (
    <MarkdownBaseButton
      icon={<IconMarkdownColorTrap />}
      tooltip="Add a trap"
      style={{
        prefix: "[t]",
        suffix: "[/t]",
      }}
      {...props}
    />
  );
};

const MarkdownHelpButton = () => {
  return (
    <Link
      className={styles.button}
      icon={<IconHelp />}
      to="/text-formatting-guide"
      forceNewWindow={true}
    />
  );
};

export {
  MarkdownHeaderButton,
  MarkdownBoldButton,
  MarkdownItalicButton,
  MarkdownStrikeThroughButton,
  MarkdownQuoteButton,
  MarkdownCodeButton,
  MarkdownLinkButton,
  MarkdownImageButton,
  MarkdownUnorderedListButton,
  MarkdownOrderedListButton,
  MarkdownAlignCenterButton,
  MarkdownColorSecretButton,
  MarkdownColorPickupButton,
  MarkdownColorObjectButton,
  MarkdownColorEnemyButton,
  MarkdownColorTrapButton,
  MarkdownHelpButton,
};
