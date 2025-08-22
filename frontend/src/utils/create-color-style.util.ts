const createColorStyle = (cssVar: string, color?: string, opacity?: number) => {
  let finalColor = color || "#818cf8";

  if (opacity !== undefined && opacity >= 0 && opacity <= 1) {
    const hex = finalColor.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    finalColor = `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  return {
    [cssVar]: finalColor,
  } as React.CSSProperties;
};

export default createColorStyle;
