import type { FormulaNoteData } from "../types/appTypes";

type FormulaNoteProps = {
  note: FormulaNoteData;
};

export function FormulaNote({ note }: FormulaNoteProps) {
  return (
    <section className="formula-note page">
      <div>
        <p className="formula-kicker">Formula first / 先看公式</p>
        <h2 className="formula-title">{note.title}</h2>
        <p className="formula-title-zh">{note.titleZh}</p>
      </div>

      <div className="formula-grid">
        <div className="formula-box">
          <p className="formula-label">Formula</p>
          <p className="formula-text">{note.formula}</p>
          <p className="formula-text-zh">{note.formulaZh}</p>
        </div>

        <div className="formula-box">
          <p className="formula-label">Sport science concept</p>
          <p className="formula-copy">{note.concept}</p>
          <p className="formula-copy">{note.conceptZh}</p>
        </div>
      </div>

      <div className="formula-footer">
        <span className="evidence-label">{note.evidenceType}</span>
        <div className="formula-reference-list">
          {note.references.map((reference) => (
            <a
              key={reference.url}
              href={reference.url}
              target="_blank"
              rel="noreferrer"
              className="formula-reference"
            >
              {reference.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
