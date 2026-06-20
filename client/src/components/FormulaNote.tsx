import type { FormulaNoteData } from "../types/appTypes";
import { getEvidenceTypeLabel } from "../helpers/displayLabels";

type FormulaNoteProps = {
  note: FormulaNoteData;
};

export function FormulaNote({ note }: FormulaNoteProps) {
  return (
    <section className="formula-note page">
      <div>
        <p className="formula-kicker">进阶解释</p>
        <h2 className="formula-title">{note.titleZh}</h2>
      </div>

      <div className="formula-grid">
        <div className="formula-box">
          <p className="formula-label">计算方式</p>
          <p className="formula-text-zh">{note.formulaZh}</p>
        </div>

        <div className="formula-box">
          <p className="formula-label">为什么重要</p>
          <p className="formula-copy">{note.conceptZh}</p>
        </div>
      </div>

      <div className="formula-footer">
        <span className="evidence-label">{getEvidenceTypeLabel(note.evidenceType)}</span>
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
