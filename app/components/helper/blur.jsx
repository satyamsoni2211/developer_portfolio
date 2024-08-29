"use client";

import React, { useRef, useState, useEffect } from "react";

const BlurOnScroll = (props) => {
  const elementRef = useRef(null);
  const [blurAmount, setBlurAmount] = useState(0);
  const max = props?.max || 5;
  const { isBig, name } = props;
  const threshold =
    props?.threshold || Array.from({ length: 101 }, (_, i) => i / 100);

  useEffect(() => {
    const handleScroll = (entries) => {
      entries.forEach((entry) => {
        const { intersectionRatio } = entry;
        if ((isBig && !(intersectionRatio > 0.75)) || !isBig) {
          // Calculate blur based on how much the element is out of the viewport
          const blurValue = Math.min(max, (1 - intersectionRatio) * max); // max blur of 20px
          setBlurAmount(blurValue);
        } else {
          setBlurAmount(0);
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
