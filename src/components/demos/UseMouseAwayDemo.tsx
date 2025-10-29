"use client";

import { RefObject, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { useMouseAway } from "@/hooks/useMouseAway";
import { FrownIcon, ShoppingCartIcon } from "lucide-react";

const ENABLE_OUT_OF_STOCK = false;

export default function UseMouseAwayDemo() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { ref, style } = useMouseAway({
    boundsRef: containerRef,
    radius: 140,
    strength: 220,
  });

  const [outOfStock, setOutOfStock] = useState(false);
  useEffect(() => {
    if (!ENABLE_OUT_OF_STOCK) return;
    const t = setTimeout(() => setOutOfStock(true), 8000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Try to click Checkout. It will try to avoid you.
      </p>
      <div
        ref={containerRef}
        className="relative h-64 rounded-xl border bg-background/40 p-2 overflow-hidden"
      >
        <motion.div
          ref={ref as unknown as RefObject<HTMLDivElement | null>}
          style={style}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <Button size="lg" disabled={outOfStock}>
            {outOfStock ? (
              <>
                <FrownIcon size={16} /> Out of Stock
              </>
            ) : (
              <>
                <ShoppingCartIcon size={16} /> Checkout
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
