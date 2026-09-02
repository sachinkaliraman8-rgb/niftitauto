"use client";

import { useEffect } from "react";

/**
 * Ported 1:1 from the original static landing page's inline <script>:
 * fade-in-on-scroll for `.rv` blocks, plus the scroll-driven chart-layer
 * reveal in the showcase section. Renders nothing itself.
 */
export default function ScrollEffects() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const rv = document.querySelectorAll(".rv");
    let io: IntersectionObserver | undefined;
    if (reduce || !("IntersectionObserver" in window)) {
      rv.forEach((el) => el.classList.add("on"));
    } else {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("on");
              io?.unobserve(e.target);
            }
          });
        },
        { threshold: 0.15 }
      );
      rv.forEach((el) => io?.observe(el));
    }

    const steps = document.querySelectorAll<HTMLElement>(".sc-steps > div");
    const wide = window.matchMedia("(min-width: 901px)");
    const order = ["L1", "L2", "L3"];

    function setStage(idx: number) {
      order.forEach((id, i) => {
        const el = document.getElementById(id);
        if (!el) return;
        if (i <= idx) el.classList.add("on");
        else el.classList.remove("on");
      });
      steps.forEach((s, i) => {
        if (i === idx) s.classList.add("on");
        else s.classList.remove("on");
      });
    }

    function showAll() {
      order.forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.classList.add("on");
      });
      steps.forEach((s) => s.classList.add("on"));
    }

    let so: IntersectionObserver | undefined;
    if (!wide.matches || reduce || !("IntersectionObserver" in window)) {
      showAll();
    } else {
      so = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              setStage(Array.prototype.indexOf.call(steps, e.target));
            }
          });
        },
        { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
      );
      steps.forEach((s) => so?.observe(s));
    }

    return () => {
      io?.disconnect();
      so?.disconnect();
    };
  }, []);

  return null;
}
