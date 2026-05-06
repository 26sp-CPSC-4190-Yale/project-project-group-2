/**
 * @component
 */

import { ReactNode, useState } from "react";
import styles from "./HoverSvg.module.css";

type HoverSvgProps = {
  defaultSvg: ReactNode;
  hoverSvg: ReactNode;
  className?: string;
  onClick?: () => void;
};

export default function HoverSvg({
  defaultSvg,
  hoverSvg,
  className = "",
  onClick,
}: HoverSvgProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`${styles.wrapper} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {isHovered ? hoverSvg : defaultSvg}
    </div>
  );
}