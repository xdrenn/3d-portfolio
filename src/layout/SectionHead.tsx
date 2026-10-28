type SectionHeadProps = {
  title: string;
};

export function SectionHead({ title}: SectionHeadProps) {
  return (
    <div className="section-head grid">
      <h2 className="section-head__title">{title}</h2>
    </div>
  );
}
