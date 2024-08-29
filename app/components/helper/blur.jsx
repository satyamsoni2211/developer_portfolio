"use client";

import React, { useRef, useState, useEffect } from "react";

const BlurOnScroll = (props) => {
  const elementRef = useRef(null);
  const [blurAmount, setBlurAmount] = useState(0);
  const max = props?.max || 5;
  const threshold =
    props?.threshold || Array.from({ length: 101 }, (_, i) => i / 100);

  useEffect(() => {
    const handleScroll = (entries) => {
      entries.forEach((entry) => {
        const { boundingClientRect, rootBounds } = entry;

        if (rootBounds) {
          const elementHeight = boundingClientRect.height;
          const viewportHeight = rootBounds.height;

          // Calculate the visible height of the element
          const visibleHeight = Math.min(
            elementHeight,
            Math.max(0, boundingClientRect.bottom - rootBounds.top)
          );

          // Calculate the ratio of the element's visibility in the viewport
          const visibilityRatio =
            visibleHeight / Math.min(viewportHeight, elementHeight);

          // Calculate blur amount based on visibility
          const blurValue = Math.min(max, (1 - visibilityRatio) * max); // max blur of 20px
          setBlurAmount(blurValue);
        }
      });
    };

    const observer = new IntersectionObserver(handleScroll, {
      threshold, // creates a threshold from 0 to 1
    });

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={elementRef}
      className="transition-all duration-100"
      style={{
        filter: `blur(${blurAmount}px)`,
      }}
    >
      {props.children}
    </div>
  );
};

export default BlurOnScroll;
