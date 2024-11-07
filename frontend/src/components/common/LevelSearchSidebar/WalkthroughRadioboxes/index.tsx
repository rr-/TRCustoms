import { Radioboxes } from "src/components/common/Radioboxes";

type NullableBoolean = boolean | null;

interface WalkthroughRadioboxesProps {
  videoWalkthroughs?: NullableBoolean;
  textWalkthroughs?: NullableBoolean;
  onChange: (
    videoWalkthroughs: NullableBoolean,
    textWalkthroughs: NullableBoolean
  ) => any;
}

interface RadioOption {
  id: NullableBoolean;
  name: string;
}

const WalkthroughRadioboxes = ({
  videoWalkthroughs,
  textWalkthroughs,
  onChange,
}: WalkthroughRadioboxesProps) => {
  const videoOptions: RadioOption[] = [
    { id: null, name: "Show all" },
    { id: true, name: "With videos" },
    { id: false, name: "Without videos" },
  ];

  const textOptions: RadioOption[] = [
    { id: null, name: "Show all" },
    { id: true, name: "With text" },
    { id: false, name: "Without text" },
  ];

  const onVideoRadioboxChange = (value: NullableBoolean): void => {
    onChange(value ?? null, textWalkthroughs ?? null);
  };

  const onTextRadioboxChange = (value?: NullableBoolean): void => {
    onChange(videoWalkthroughs ?? null, value ?? null);
  };

  return (
    <>
      <p>Videos:</p>
      <Radioboxes<RadioOption, NullableBoolean>
        options={videoOptions}
        value={videoWalkthroughs}
        onChange={onVideoRadioboxChange}
        getOptionId={(option: RadioOption) => option.id}
        getOptionName={(option: RadioOption) => option.name}
      />

      <p>Text:</p>
      <Radioboxes<RadioOption, NullableBoolean>
        options={textOptions}
        value={textWalkthroughs}
        onChange={onTextRadioboxChange}
        getOptionId={(option: RadioOption) => option.id}
        getOptionName={(option: RadioOption) => option.name}
      />
    </>
  );
};

export { WalkthroughRadioboxes };
