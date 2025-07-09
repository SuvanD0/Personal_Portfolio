// React and library imports
import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
// Local styles
import "./TiltedCard.css";
import type { TiltedCardProps } from "./TiltedCard.types";

// --- Types ---

// --- Constants ---
const SPRING_VALUES = {
  damping: 30,
  stiffness: 100,
  mass: 2,
};

const DEFAULT_PROPS = {
  altText: "Tilted card image",
  captionText: "",
  containerHeight: "300px",
  containerWidth: "100%",
  imageHeight: "300px",
  imageWidth: "300px",
  scaleOnHover: 1.1,
  rotateAmplitude: 14,
  showMobileWarning: true,
  showTooltip: true,
  overlayContent: null,
  displayOverlayContent: false,
};

// --- Component ---
export default function TiltedCard(props: TiltedCardProps) {
  // Merge props with defaults
  const {
    imageSrc,
    altText,
    captionText,
    containerHeight,
    containerWidth,
    imageHeight,
    imageWidth,
    scaleOnHover,
    rotateAmplitude,
    showMobileWarning,
    showTooltip,
    overlayContent,
    displayOverlayContent,
    style,
  } = { ...DEFAULT_PROPS, ...props };

  // Refs and motion values
  const ref = useRef<HTMLDivElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useMotionValue(0), SPRING_VALUES);
  const rotateY = useSpring(useMotionValue(0), SPRING_VALUES);
  const scale = useSpring(1, SPRING_VALUES);
  const opacity = useSpring(0);
  const rotateFigcaption = useSpring(0, {
    stiffness: 350,
    damping: 30,
    mass: 1,
  });
  const [lastY, setLastY] = useState(0);

  // --- Event Handlers ---
  function handleMouse(e: React.MouseEvent) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;
    const rotationX = (offsetY / (rect.height / 2)) * -rotateAmplitude;
    const rotationY = (offsetX / (rect.width / 2)) * rotateAmplitude;
    rotateX.set(rotationX);
    rotateY.set(rotationY);
    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);
    const velocityY = offsetY - lastY;
    rotateFigcaption.set(-velocityY * 0.6);
    setLastY(offsetY);
  }

  function handleMouseEnter() {
    scale.set(scaleOnHover);
    opacity.set(1);
  }

  function handleMouseLeave() {
    opacity.set(0);
    scale.set(1);
    rotateX.set(0);
    rotateY.set(0);
    rotateFigcaption.set(0);
  }

  // --- Render ---
  return (
    <figure
      ref={ref}
      className="tilted-card-figure"
      style={{ height: containerHeight, width: containerWidth, ...style }}
      onMouseMove={handleMouse}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Mobile warning */}
      {showMobileWarning && (
        <div className="tilted-card-mobile-alert">
          This effect is not optimized for mobile. Check on desktop.
        </div>
      )}

      {/* Card inner with image and overlay */}
      <motion.div
        className="tilted-card-inner"
        style={{ width: imageWidth, height: imageHeight, rotateX, rotateY, scale }}
      >
        <motion.img
          src={imageSrc}
          alt={altText}
          className="tilted-card-img"
          style={{ width: imageWidth, height: imageHeight, borderRadius: '8px' }}
        />
        {displayOverlayContent && overlayContent && (
          <motion.div className="tilted-card-overlay">{overlayContent}</motion.div>
        )}
      </motion.div>

      {/* Tooltip/caption */}
      {showTooltip && (
        <motion.figcaption
          className="tilted-card-caption"
          style={{ x, y, opacity, rotate: rotateFigcaption }}
        >
          {captionText}
        </motion.figcaption>
      )}
    </figure>
  );
} 