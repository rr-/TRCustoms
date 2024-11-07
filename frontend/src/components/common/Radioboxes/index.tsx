import { isEqual } from "lodash";
import { Radiobox } from "src/components/common/Radiobox";

interface RadioboxesProps<TOption, TOptionId> {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  options: TOption[];
  value: TOptionId | null | undefined;
  onChange: (value: TOptionId) => any;
  getOptionId: (option: TOption) => TOptionId;
  getOptionName: (option: TOption) => string;
  getOptionSortPosition?: (option: TOption) => any;
}

const Radioboxes = <TOption extends {}, TOptionId extends {} | null>({
  header,
  footer,
  options,
  value,
  onChange,
  getOptionId,
  getOptionName,
  getOptionSortPosition,
}: RadioboxesProps<TOption, TOptionId>) => {
  const handleOptionChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    option: TOption
  ) => {
    onChange(getOptionId(option));
  };

  return (
    <div>
      {header && <>{header}:</>}

      {options.map((option) => (
        <Radiobox
          key={getOptionName(option)}
          label={getOptionName(option)}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            handleOptionChange(event, option)
          }
          checked={isEqual(value, getOptionId(option))}
        />
      ))}

      {footer}
    </div>
  );
};

export { Radioboxes };
