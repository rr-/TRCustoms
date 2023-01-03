import styles from "./index.module.css";
import { range } from "lodash";
import { Dropdown } from "src/components/common/Dropdown";
import type { DropdownOption } from "src/components/common/Dropdown";

interface DatePickerProps {
  value?: string;
  onChange: (date: string) => any;
}

const DatePicker = ({ value, onChange }: DatePickerProps) => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const monthOptions: DropdownOption[] = months.map((monthName, i) => ({
    label: monthName,
    value: i + 1,
  }));

  const yearOptions: DropdownOption[] = range(
    1999,
    new Date().getFullYear() + 1
  ).map((year) => ({ label: `${year}`, value: year }));

  let [selectedYear, selectedMonth]: string[] = (value || "").split(/-/);

  const submitChange = (year: string, month: string) => {
    onChange(`${year || ""}-${month || ""}`.replace(/-$/, ""));
  };

  const onMonthChange = (month: string) => {
    submitChange(selectedYear, month);
  };
  const onYearChange = (year: string) => {
    submitChange(year, selectedMonth);
  };

  return (
    <div className={styles.wrapper}>
      <Dropdown
        className={styles.select}
        allowNull={true}
        nullLabel="-"
        options={yearOptions}
        value={selectedYear}
        onChange={onYearChange}
      />
      <Dropdown
        className={styles.select}
        allowNull={true}
        nullLabel="-"
        options={monthOptions}
        value={selectedMonth}
        onChange={onMonthChange}
      />
    </div>
  );
};

export { DatePicker };
