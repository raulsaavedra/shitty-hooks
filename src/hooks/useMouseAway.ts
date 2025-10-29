"use client";

import { useEffect, useMemo, useRef, RefObject } from "react";
import { useMotionValue, useSpring } from "motion/react";

/**
 * Algorithm
 * 1) Find the element center and the pointer position.
 * 2) If the pointer is inside a circular bubble (radius), compute which way to push the element
 *    (straight away from the pointer) and how hard to push (stronger when closer).
 * 3) Apply the push as a CSS translate, but clamp so the element stays inside a container.
 * 4) Animate to the new spot with a spring; when outside the bubble, spring back to (0, 0).
 */

type BoundsRef = RefObject<HTMLElement | null> | "viewport" | undefined;

export type UseMouseAwayOptions = {
  radius?: number;
  strength?: number;
  boundsRef?: BoundsRef; // clamp movement to this container or viewport
  disabled?: boolean;
  respectReducedMotion?: boolean;
  spring?: Parameters<typeof useSpring>[1];
};

export function useMouseAway(options: UseMouseAwayOptions = {}) {
  const {
    radius = 120,
    strength = 180,
    boundsRef,
    disabled = false,
    respectReducedMotion = true,
    spring: springOpts,
  } = options;

  const elementRef = useRef<HTMLElement | null>(null);

  // Use a spring on top of raw motion values for a smooth inertial feel.
  const rawTranslateX = useMotionValue(0);
  const rawTranslateY = useMotionValue(0);
  const x = useSpring(
    rawTranslateX,
    springOpts ?? { stiffness: 250, damping: 22 }
  );
  const y = useSpring(
    rawTranslateY,
    springOpts ?? { stiffness: 250, damping: 22 }
  );

  const reduceMotion = useMemo(() => {
    if (!respectReducedMotion) return false;
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  }, [respectReducedMotion]);

  useEffect(() => {
    if (disabled || reduceMotion) {
      rawTranslateX.set(0);
      rawTranslateY.set(0);
      return;
    }

    function getContainerRect() {
      if (boundsRef === "viewport" || !boundsRef) {
        return {
          left: 0,
          top: 0,
          right: window.innerWidth,
          bottom: window.innerHeight,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      }
      const node = boundsRef.current;
      return node
        ? node.getBoundingClientRect()
        : {
            left: 0,
            top: 0,
            right: window.innerWidth,
            bottom: window.innerHeight,
            width: window.innerWidth,
            height: window.innerHeight,
          };
    }

    function howFarInsideBubble(
      distanceToPointer: number,
      bubbleRadius: number
    ) {
      // Returns a 0..1 factor: 0 at the edge of the bubble, 1 at the cursor.
      const factor = 1 - distanceToPointer / bubbleRadius;
      return Math.max(0, Math.min(1, factor));
    }

    function getDirection(x: number, y: number) {
      // Turn any vector into just its direction (length 1). If zero-length, keep zeros.
      const length = Math.hypot(x, y);
      if (length < 0.0001) return { x: 0, y: 0, length };
      return { x: x / length, y: y / length, length };
    }

    function clampToBounds(
      proposedTx: number,
      proposedTy: number,
      elementRect: DOMRect,
      containerRect: {
        left: number;
        top: number;
        right: number;
        bottom: number;
        width: number;
        height: number;
      }
    ) {
      const predicted = {
        left: elementRect.left + proposedTx,
        top: elementRect.top + proposedTy,
        right: elementRect.right + proposedTx,
        bottom: elementRect.bottom + proposedTy,
      };

      let tx = proposedTx;
      let ty = proposedTy;
      const overflowLeft = containerRect.left - predicted.left;
      const overflowTop = containerRect.top - predicted.top;
      const overflowRight = predicted.right - containerRect.right;
      const overflowBottom = predicted.bottom - containerRect.bottom;

      if (overflowLeft > 0) tx += overflowLeft;
      if (overflowTop > 0) ty += overflowTop;
      if (overflowRight > 0) tx -= overflowRight;
      if (overflowBottom > 0) ty -= overflowBottom;
      return { tx, ty } as const;
    }

    const onPointerMove = (ev: PointerEvent | MouseEvent) => {
      const targetEl = elementRef.current;
      if (!targetEl) return;

      const elementRect = targetEl.getBoundingClientRect();
      const centerX = elementRect.left + elementRect.width / 2;
      const centerY = elementRect.top + elementRect.height / 2;
      const pointerX = (ev as PointerEvent).clientX;
      const pointerY = (ev as PointerEvent).clientY;

      // Arrow from pointer to element center. We push along this arrow.
      const pointerToCenterX = centerX - pointerX;
      const pointerToCenterY = centerY - pointerY;
      const distanceToPointer = Math.hypot(pointerToCenterX, pointerToCenterY);

      // Default: go back to origin when outside the radius
      let translateX = 0;
      let translateY = 0;

      if (distanceToPointer < radius && distanceToPointer > 0.0001) {
        const directionAway = getDirection(pointerToCenterX, pointerToCenterY);
        const insideFactor = howFarInsideBubble(distanceToPointer, radius); // 0..1
        const pushAmount = strength * insideFactor;
        translateX = directionAway.x * pushAmount;
        translateY = directionAway.y * pushAmount;

        // Keep inside the container/viewport.
        const containerRect = getContainerRect();
        const clamped = clampToBounds(
          translateX,
          translateY,
          elementRect,
          containerRect
        );
        translateX = clamped.tx;
        translateY = clamped.ty;
      }

      rawTranslateX.set(translateX);
      rawTranslateY.set(translateY);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, [
    boundsRef,
    disabled,
    radius,
    reduceMotion,
    strength,
    rawTranslateX,
    rawTranslateY,
  ]);

  return {
    ref: (node: HTMLElement | null) => {
      elementRef.current = node;
    },
    x,
    y,
    style: { x, y } as const,
  };
}

export default useMouseAway;
