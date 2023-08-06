import { Radioboxes } from "src/components/common/Radioboxes";

interface WalkthroughRadioboxesProps {
  videoWalkthroughs: boolean | null | undefined;
  textWalkthroughs: boolean | null | undefined;
  onChange: (
    videoWalkthroughs: boolean | null,
    textWalkthroughs: boolean | null
  ) => any;
}

interface OptionId {
  videoWalkthroughs: boolean | null | undefined;
  textWalkthroughs: boolean | null | undefined;
}

interface Option {
  id: OptionId;
  name: string;
}

const WalkthroughRadioboxes = ({
  videoWalkthroughs,
  textWalkthroughs,
  onChange,
}: WalkthroughRadioboxesProps) => {
  const value: OptionId = { videoWalkthroughs, textWalkthroughs };

  const options: Option[] = [
    {
      id: { videoWalkthroughs: null, textWalkthroughs: null },
      name: "Show all",
    },
    {
      id: { videoWalkthroughs: true, textWalkthroughs: false },
      name: "Video only",
    },
    {
      id: { videoWalkthroughs: false, textWalkthroughs: true },
      name: "Text only",
    },
    {
      id: { videoWalkthroughs: false, textWalkthroughs: null },
      name: "No video",
    },
    {
      id: { videoWalkthroughs: null, textWalkthroughs: false },
      name: "No text",
    },
    {
      id: { videoWalkthroughs: false, textWalkthroughs: false },
      name: "No walkthroughs",
    },
  ];

  const onChangeInternal = (value: OptionId | null | undefined): void => {
    if (value) {
      onChange(value.videoWalkthroughs ?? null, value.textWalkthroughs ?? null);
    } else {
      onChange(null, null);
    }
  };

  return (
    <Radioboxes
      options={options}
      value={value}
      onChange={onChangeInternal}
      getOptionId={(entity: Option) => entity.id}
      getOptionName={(entity: Option) => entity.name}
    />
  );
};

export { WalkthroughRadioboxes };
