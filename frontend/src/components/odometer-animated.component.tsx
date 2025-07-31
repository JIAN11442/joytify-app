import { ReactNode } from "react";
import { useEffect, useState } from "react";
import Odometer from "react-odometerjs";
import "odometer/themes/odometer-theme-default.css";

type ValueType = number | string | ReactNode;

type OdometerAnimatedProps = {
  value: ValueType;
  format?: string;
  className?: string;
  type?: "number" | "duration" | "percentage" | "currency" | "text";
  prefix?: string;
  suffix?: string;
};

const OdometerAnimated = ({
  value,
  format = "(,ddd).dd",
  className,
  type = "number",
  prefix = "",
  suffix = "",
}: OdometerAnimatedProps) => {
  const [displayValue, setDisplayValue] = useState<ValueType>(0);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDisplayValue(value);
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [value]);

  // according to the type, render the content
  const renderContent = () => {
    if (typeof value === "string") {
      return (
        <span className={className}>
          {prefix}
          {value}
          {suffix}
        </span>
      );
    }

    // 數字類型
    switch (type) {
      case "duration":
        return (
          <span className={className}>
            {prefix}
            <Odometer value={displayValue as number} format="d" />
            {suffix}
          </span>
        );

      case "percentage":
        return (
          <span className={className}>
            {prefix}
            <Odometer value={displayValue as number} format="d" />
            {suffix}
          </span>
        );

      case "currency":
        return (
          <span className={className}>
            {prefix}
            <Odometer value={displayValue as number} format="(,ddd).dd" />
            {suffix}
          </span>
        );

      case "text":
        return (
          <span className={className}>
            {prefix}
            {value}
            {suffix}
          </span>
        );

      default:
        return (
          <span className={className}>
            {prefix}
            <Odometer value={displayValue as number} format={format} />
            {suffix}
          </span>
        );
    }
  };

  return renderContent();
};

export default OdometerAnimated;
