import { useEffect, useRef, type RefObject } from "react";

export function useOnFirstView(targetRef: RefObject<Element>, visibleRatio: number, onFirstView: () => void) {
  const callback = useRef(onFirstView);
  callback.current = onFirstView;

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        callback.current();
      },
      { threshold: visibleRatio },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [targetRef, visibleRatio]);
}
