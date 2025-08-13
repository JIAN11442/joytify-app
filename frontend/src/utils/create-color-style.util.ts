const createColorStyle = (cssVar: string, color?: string) => {
  return {
    [cssVar]: color || "#818cf8",
    filter: "brightness(1.5)",
  } as React.CSSProperties;
};

export default createColorStyle;
