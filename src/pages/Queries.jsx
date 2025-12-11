import React, { useMemo, useState } from 'react';
import { AppButton, GlassCard, SectionHeading } from '../components/ui/primitives.jsx';
import AdminGate from '../components/AdminGate.jsx';

const initialFormState = {
  name: '',
  email: '',
  projectType: '',
  budget: '',
  message: '',
};

const QueriesPage = () => {
  const [formData, setFormData] = useState(initialFormState);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [entries, setEntries] = useState([]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setSuccess(false);

    await new Promise((resolve) => setTimeout(resolve, 600));

    const entry = {
      id: `inq_${Date.now()}`,
      submittedAt: new Date().toISOString(),
      ...formData,
    };
    setEntries((prev) => [entry, ...prev]);

    setSubmitting(false);
    setSuccess(true);
    setFormData(initialFormState);
  };

  const responseItems = useMemo(
    () => [
      'Share your references and timeline.',
      'Receive a curated production plan.',
      'Approve proposal and secure slot.',
    ],
    [],
  );

  return (
    <div className="grid gap-10 lg:grid-cols-2 text-white">
      <div className="space-y-6">
        <SectionHeading align="left" eyebrow="Project brief">
          Tell us about your sound
        </SectionHeading>
        <p className="text-zinc-400">
          Share project details so we can prepare timelines, budget and deliverables. Our team responds within 24 hours.
        </p>

        <form onSubmit={handleSubmit} className="relative space-y-4 overflow-hidden rounded-[2.5rem] border border-white/5 bg-black/60 p-6 md:p-8">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-lime-500/10 via-transparent to-emerald-500/10 opacity-70" />
          <div className="pointer-events-none absolute -top-20 -right-16 h-48 w-48 rounded-full bg-lime-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -left-12 h-44 w-44 rounded-full bg-emerald-400/20 blur-3xl" />
          <div className="relative space-y-4">
          {[
            { label: 'Name', name: 'name', type: 'text', placeholder: 'Your full name', required: true },
            { label: 'Email', name: 'email', type: 'email', placeholder: 'you@example.com', required: true },
            { label: 'Project type', name: 'projectType', type: 'text', placeholder: 'Production, mixing, mastering…' },
            { label: 'Budget range', name: 'budget', type: 'text', placeholder: '$500 - $3,000' },
          ].map((field) => (
            <div key={field.name} className="space-y-2">
              <label className="text-sm text-zinc-400">{field.label}</label>
              <input
                type={field.type}
                name={field.name}
                placeholder={field.placeholder}
                value={formData[field.name]}
                onChange={handleChange}
                required={field.required}
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm focus:border-lime-400 focus:outline-none"
              />
            </div>
          ))}

          <div className="space-y-2">
            <label className="text-sm text-zinc-400">Project brief</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={5}
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm focus:border-lime-400 focus:outline-none"
            />
          </div>

          <AppButton type="submit" variant="primary" className="w-full md:w-auto">
            {submitting ? 'Sending…' : 'Submit query'}
          </AppButton>
          {success && (
            <div className="rounded-2xl border border-lime-500/40 bg-lime-500/10 px-4 py-2 text-sm text-lime-200">
              Thanks! We will respond within 24 hours.
            </div>
          )}
          </div>
        </form>
      </div>

      <div className="space-y-6">
        <GlassCard className="bg-black/50 space-y-4">
          <h3 className="text-2xl font-semibold">Booking process</h3>
          <div className="space-y-4">
            {responseItems.map((step, index) => (
              <div key={step} className="space-y-1">
                <p className="text-xs uppercase tracking-[0.3em] text-lime-300/80">Step {index + 1}</p>
                <p className="text-sm text-zinc-300">{step}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        <AdminGate>
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Latest submissions</h4>
            {entries.length === 0 ? (
              <p className="text-sm text-zinc-500">No submissions yet. Collect form data here once live.</p>
            ) : (
              <div className="space-y-3">
                {entries.map((entry) => (
                  <GlassCard key={entry.id} className="bg-black/40 space-y-2">
                    <div className="flex justify-between text-xs text-zinc-500">
                      <span>{entry.name}</span>
                      <span>{new Date(entry.submittedAt).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-zinc-300">
                      {entry.projectType && <span className="font-semibold text-white">{entry.projectType} · </span>}
                      {entry.message || 'No brief provided.'}
                    </p>
                    <p className="text-xs text-zinc-500">Budget: {entry.budget || 'TBD'}, Contact: {entry.email}</p>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>
        </AdminGate>
      </div>
    </div>
  );
};

export default QueriesPage;
