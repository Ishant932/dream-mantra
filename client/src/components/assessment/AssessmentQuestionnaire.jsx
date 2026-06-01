import { useState } from 'react';
import { ClipboardList } from 'lucide-react';

export default function AssessmentQuestionnaire({ questions, initialAnswers = {}, onSubmit, saving }) {
  const [answers, setAnswers] = useState(initialAnswers);
  const [error, setError] = useState('');

  const setAnswer = (id, value) => setAnswers((prev) => ({ ...prev, [id]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const missing = questions.find((q) => !answers[q.id]);
    if (missing) {
      setError(`Please answer: ${missing.label}`);
      return;
    }
    setError('');
    onSubmit(answers);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <ClipboardList className="w-8 h-8 text-amber-600" />
        <h1 className="font-display text-2xl md:text-3xl font-bold">Skill Mapping Questionnaire</h1>
      </div>
      <p className="text-sand-600 dark:text-sand-400 mb-8">
        Answer honestly — there are no right or wrong responses. This helps our counsellors interpret your assessment accurately.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {questions.map((q, idx) => (
          <fieldset key={q.id} className="p-4 md:p-5 rounded-xl border border-sand-200 dark:border-sand-700 bg-white/50 dark:bg-sand-900/30">
            <legend className="font-semibold text-sm md:text-base px-1 mb-3">
              <span className="text-amber-600 mr-2">{idx + 1}.</span>
              {q.label}
            </legend>
            <div className="grid sm:grid-cols-2 gap-2">
              {q.options.map((opt) => (
                <label
                  key={opt}
                  className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer text-sm transition ${
                    answers[q.id] === opt
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30 font-medium'
                      : 'border-sand-200 dark:border-sand-700 hover:border-amber-300'
                  }`}
                >
                  <input
                    type="radio"
                    name={q.id}
                    value={opt}
                    checked={answers[q.id] === opt}
                    onChange={() => setAnswer(q.id, opt)}
                    className="accent-amber-600"
                  />
                  {opt}
                </label>
              ))}
            </div>
          </fieldset>
        ))}

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button type="submit" disabled={saving} className="btn-primary w-full sm:w-auto !px-8">
          {saving ? 'Submitting…' : 'Submit questionnaire'}
        </button>
      </form>
    </div>
  );
}
