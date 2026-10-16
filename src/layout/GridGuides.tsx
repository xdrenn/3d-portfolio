import "./layout.css";

const COLUMN_COUNT = 12;

export function GridGuides() {
  return (
    <div className="grid-guides grid" aria-hidden="true">
      {Array.from({ length: COLUMN_COUNT }, (_, column) => (
        <i key={column} className="grid-guides__column" />
      ))}
    </div>
  );
}
