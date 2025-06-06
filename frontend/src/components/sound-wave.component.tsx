import React, { useEffect, useState } from "react";

interface SoundWaveProps {
  isPlaying?: boolean;
  color?: string;
  barWidth?: number;
  barCount?: number;
  minHeight?: number;
  maxHeight?: number;
  animate_delay?: number;
  style?: React.CSSProperties;
}

const SoundWave: React.FC<SoundWaveProps> = ({
  isPlaying = true,
  color = "#1DB954",
  barWidth = 2,
  barCount = 3,
  minHeight = 1,
  maxHeight = 12,
  animate_delay = 0.2,
  style,
}) => {
  const [bars, setBars] = useState<number[]>([]);

  useEffect(() => {
    setBars(
      Array.from({ length: barCount }, () => Math.random() * (maxHeight - minHeight) + minHeight)
    );
  }, [barCount, maxHeight, minHeight]);

  return (
    <div
      className={`
        flex 
        items-end 
        space-x-0.5
    `}
      style={style}
    >
      {bars.map((height, index) => (
        <div
          key={index}
          className={isPlaying ? "sound-wave-bar" : ""}
          style={
            {
              width: `${barWidth}px`,
              height: `${height}px`,
              backgroundColor: color,
              transition: "height 0.5s ease",
              animationDelay: `${index * animate_delay}s`,
              "--min-height": `${minHeight}px`,
              "--max-height": `${maxHeight}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
};

export default SoundWave;
