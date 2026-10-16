import { useEffect, useRef, type RefObject } from "react";

export function useInViewRef(targetRef: RefObject<Element>, minVisibleRatio = 0) {
  const isInView = useRef(false);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          isInView.current = minVisibleRatio > 0 ? entry.intersectionRatio > minVisibleRatio : entry.isIntersecting;
        }
      },
      { threshold: [0, minVisibleRatio, 1] },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [targetRef, minVisibleRatio]);

  return isInView;
}
