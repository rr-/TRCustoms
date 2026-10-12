import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { DropDownField } from "src/components/forms/fields/DropDownField";
import type { DropDownFieldProps } from "src/components/forms/fields/DropDownField";
import { useConfig } from "src/stores/config";

const CONFIG_REFRESH_INTERVAL = 5 * 60 * 1000;

const addDays = (isoDate: string, days: number): string => {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

const formatReleaseDate = (isoDate: string): string =>
  new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

const ReleaseDateField = ({
  name,
  ...props
}: Omit<DropDownFieldProps, "options">) => {
  const { config, refetchConfig } = useConfig();
  const { getValues, setValue } = useFormContext();
  const today = config.server_date;

  useEffect(() => {
    refetchConfig();
    const interval = setInterval(refetchConfig, CONFIG_REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [refetchConfig]);

  useEffect(() => {
    const value = getValues(name);
    if (!value || value < today) {
      setValue(name, today);
    }
  }, [name, today, getValues, setValue]);

  const options = Array.from(
    { length: config.limits.max_release_delay_days + 1 },
    (_, i) => {
      const value = addDays(today, i);
      return {
        value,
        label: i === 0 ? "Today, once approved" : formatReleaseDate(value),
      };
    },
  );

  return <DropDownField {...props} name={name} options={options} />;
};

export { ReleaseDateField };
