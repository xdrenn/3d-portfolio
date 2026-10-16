import type { ReactNode } from "react";

type SectionHeadProps = {
  title: string;
  children: ReactNode;
};

export function SectionHead({ title, children }: SectionHeadProps) {
  return (
    <div className="section-head grid">
      <h2 className="section-head__title">{title}</h2>
      <p className="section-head__lead text-small">{children}</p>
    </div>
  );
}
