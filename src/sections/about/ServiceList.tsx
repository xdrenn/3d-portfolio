import { SERVICES } from "@/content/site";

export function ServiceList() {
  return (
    <ul className="services grid">
      {SERVICES.map((service) => (
        <li key={service.title} className="services__item">
          <h3 className="services__title">{service.title}</h3>
          <p className="services__description">{service.description}</p>
        </li>
      ))}
    </ul>
  );
}
