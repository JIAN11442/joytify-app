import { useEffect, useRef, useState } from "react";

export const useAutoFitFont = ({
  text,
  maxSingle = 6,
  maxDouble = 3,
  min = 2,
}: {
  text: string;
  maxSingle?: number;
  maxDouble?: number;
  min?: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(maxSingle);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const resize = () => {
      let current = maxSingle;
      el.style.fontSize = `${current}rem`;

      const measureLines = () => {
        const lineHeight = parseFloat(getComputedStyle(el).lineHeight);
        return Math.round(el.scrollHeight / lineHeight);
      };

      // --- Single line ---
      if (measureLines() === 1) {
        while ((el.scrollWidth > el.clientWidth || measureLines() > 1) && current > min) {
          current -= 0.1;
          el.style.fontSize = `${current}rem`;
        }
      }

      // --- Multiple lines ---
      if (measureLines() > 1) {
        if (current > maxDouble) {
          current = maxDouble;
          el.style.fontSize = `${current}rem`;
        }
        while (measureLines() > 2 && current > min) {
          current -= 0.1;
          el.style.fontSize = `${current}rem`;
        }
      }

      setFontSize(current);
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [text, maxSingle, maxDouble, min]);

  return { ref, fontSize };
};
