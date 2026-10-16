import { primaryCategory, PROJECT_COUNT, PROJECTS } from "@/content/projects";
import { usePortfolio } from "@/state/PortfolioContext";

export function ProjectIndex() {
  const { showProjectOnComputer } = usePortfolio();

  return (
    <div className="project-index">
      <h3 className="project-index__header">
        <span>Index</span>
        <span>({PROJECT_COUNT})</span>
      </h3>
      <ul className="project-index__list">
        {PROJECTS.map((project, projectIndex) => (
          <li key={project.title}>
            <button className="project-index__item" onClick={() => showProjectOnComputer(projectIndex)}>
              <span className="project-index__title">{project.title}</span>
              <span className="project-index__category">{primaryCategory(project)}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
