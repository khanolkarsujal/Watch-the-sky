import { useEffect, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';

export type StudioSection = 'work' | 'about' | 'journal' | 'contact';

interface StudioDrawerProps {
  section: StudioSection | null;
  onSelectSection: (section: StudioSection) => void;
  onClose: () => void;
}

const PROJECTS = [
  {
    title: 'Kelp Canopy Commons',
    meta: 'Marine Restoration · Oregon Coast · 2025',
    summary:
      'Living shoreline architecture cultivating bull kelp forests alongside tidal research walkways.',
  },
  {
    title: 'Solstice Seed Archive',
    meta: 'Botanical Heritage · Kyoto · 2024',
    summary:
      'Zero-carbon subterranean vault and seasonal wildflower meadow preserving 1,400 native cultivars.',
  },
  {
    title: 'Tidal Timber Pavilion',
    meta: 'Regenerative Materials · Wellington · 2024',
    summary:
      'Mycelium-insulated coastal gathering hall assembled from salvaged windfall cedar.',
  },
];

const JOURNAL_NOTES = [
  {
    title: 'Designing for Succession Instead of Permanence',
    meta: 'Field Note 04 · 6 min read',
    summary:
      'Why living landscapes gain resilience when structures invite moss, pollinators, and seasonal decay.',
  },
  {
    title: 'Nocturnal Pollinators & Dark-Sky Thresholds',
    meta: 'Field Note 03 · 4 min read',
    summary:
      'Calibrating bioluminescent-scale outdoor lighting so moth and night-bloom rhythms stay undisturbed.',
  },
];

export function StudioDrawer({ section, onSelectSection, onClose }: StudioDrawerProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!section) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [section, onClose]);

  if (!section) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !email.includes('@') || !message.trim()) {
      setError('Please enter your name, a valid email address, and a brief project note.');
      return;
    }
    setError(null);
    setSubmitted(true);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Fernhollow ${section}`}
      className="fixed inset-0 z-20 flex items-center justify-center p-5 sm:p-8"
      style={{ backgroundColor: 'rgba(4, 6, 10, 0.84)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl border border-[#f5efe2]/20 bg-[#090c12] p-6 sm:p-10 text-[#f5efe2]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-[#f5efe2]/15 pb-5">
          <div className="flex items-center gap-6 text-xs font-medium uppercase tracking-[0.16em]">
            {(['work', 'about', 'journal', 'contact'] as StudioSection[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setError(null);
                  onSelectSection(tab);
                }}
                className={`transition-opacity whitespace-nowrap ${
                  section === tab ? 'opacity-100 underline underline-offset-8' : 'opacity-50 hover:opacity-85'
                }`}
              >
                {tab === 'contact' ? 'Let’s talk' : tab}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="grid h-10 w-10 place-items-center rounded-full border border-[#f5efe2]/30 text-[#f5efe2] transition-colors hover:bg-[#f5efe2] hover:text-[#151510]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-7 max-h-[65vh] overflow-y-auto pr-1">
          {section === 'work' && (
            <div className="space-y-6">
              <h2
                className="text-4xl sm:text-5xl font-normal tracking-tight"
                style={{ fontFamily: 'Antonio, "Arial Narrow", sans-serif' }}
              >
                Selected Regenerative Work
              </h2>
              <div className="divide-y divide-[#f5efe2]/15">
                {PROJECTS.map((item) => (
                  <article key={item.title} className="py-5 first:pt-2 last:pb-0">
                    <p className="text-xs uppercase tracking-[0.14em] text-[#f5efe2]/60">
                      {item.meta}
                    </p>
                    <h3 className="mt-1.5 text-xl font-medium text-[#f5efe2]">{item.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-[#f5efe2]/75">
                      {item.summary}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          )}

          {section === 'about' && (
            <div className="space-y-5">
              <h2
                className="text-4xl sm:text-5xl font-normal tracking-tight"
                style={{ fontFamily: 'Antonio, "Arial Narrow", sans-serif' }}
              >
                Observing the infinite expanse.
              </h2>
              <p className="text-base leading-relaxed text-[#f5efe2]/85">
                Fernhollow Observatories unites deep-space telemetry, stellar spectroscopy,
                and celestial cartography. Every observation begins by listening to cosmic
                microwave background whispers and planetary alignments before a single spectrum is recorded.
              </p>
              <p className="text-sm leading-relaxed text-[#f5efe2]/70">
                Mauna Kea · Atacama · Canary Islands
              </p>
            </div>
          )}

          {section === 'journal' && (
            <div className="space-y-6">
              <h2
                className="text-4xl sm:text-5xl font-normal tracking-tight"
                style={{ fontFamily: 'Antonio, "Arial Narrow", sans-serif' }}
              >
                Studio Field Notes
              </h2>
              <div className="divide-y divide-[#f5efe2]/15">
                {JOURNAL_NOTES.map((note) => (
                  <article key={note.title} className="py-5 first:pt-2 last:pb-0">
                    <p className="text-xs uppercase tracking-[0.14em] text-[#f5efe2]/60">
                      {note.meta}
                    </p>
                    <h3 className="mt-1.5 text-xl font-medium text-[#f5efe2]">{note.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-[#f5efe2]/75">
                      {note.summary}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          )}

          {section === 'contact' && (
            <div className="space-y-5">
              <h2
                className="text-4xl sm:text-5xl font-normal tracking-tight"
                style={{ fontFamily: 'Antonio, "Arial Narrow", sans-serif' }}
              >
                Begin a Conversation
              </h2>
              {submitted ? (
                <div className="border border-[#f5efe2]/25 p-5">
                  <p className="text-base font-medium text-[#f5efe2]">
                    Thank you, {name}. Your note has been received.
                  </p>
                  <p className="mt-1.5 text-sm text-[#f5efe2]/75">
                    Our studio team will respond to {email} within two working days.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-xs uppercase tracking-[0.14em] text-[#f5efe2]/75">
                      Name
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="mt-2 w-full border border-[#f5efe2]/25 bg-transparent px-3.5 py-2.5 text-sm text-[#f5efe2] placeholder:text-[#f5efe2]/35"
                      />
                    </label>
                    <label className="block text-xs uppercase tracking-[0.14em] text-[#f5efe2]/75">
                      Email
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@studio.org"
                        className="mt-2 w-full border border-[#f5efe2]/25 bg-transparent px-3.5 py-2.5 text-sm text-[#f5efe2] placeholder:text-[#f5efe2]/35"
                      />
                    </label>
                  </div>
                  <label className="block text-xs uppercase tracking-[0.14em] text-[#f5efe2]/75">
                    Project Brief
                    <textarea
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us about your site, ecology, or timeline."
                      className="mt-2 w-full border border-[#f5efe2]/25 bg-transparent px-3.5 py-2.5 text-sm text-[#f5efe2] placeholder:text-[#f5efe2]/35"
                    />
                  </label>
                  {error && (
                    <p role="alert" className="text-xs text-[#f5c2b8]">
                      {error}
                    </p>
                  )}
                  <button
                    type="submit"
                    className="inline-flex h-11 items-center rounded-full bg-[#f5efe2] px-6 text-xs font-medium uppercase tracking-[0.16em] text-[#151510] transition-transform hover:-translate-y-0.5"
                  >
                    Send Inquiry
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
