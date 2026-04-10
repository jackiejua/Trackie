import React, { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { addJournalEntry, db, deleteJournalEntry, saveDailyProductivity } from '../db';

const EMPTY_ITEMS = [];

function ProductivityPanel() {
  const today = new Date().toISOString().slice(0, 10);
  const journalsQuery = useLiveQuery(() => db.journals.orderBy('createdAt').reverse().limit(7).toArray());
  const journals = journalsQuery ?? EMPTY_ITEMS;
  const todayRating = useLiveQuery(() => db.productivity.where('date').equals(today).first());

  const [journalText, setJournalText] = useState('');
  const [journalMood, setJournalMood] = useState('focused');
  const [journalTags, setJournalTags] = useState('wins');
  const [promptResponse, setPromptResponse] = useState('');
  const [rating, setRating] = useState(3);
  const [ratingTouched, setRatingTouched] = useState(false);
  const [ratingNote, setRatingNote] = useState('');
  const [ratingNoteTouched, setRatingNoteTouched] = useState(false);
  const [error, setError] = useState('');

  const productivityRatingsQuery = useLiveQuery(() => db.productivity.toArray());
  const productivityRatings = productivityRatingsQuery ?? EMPTY_ITEMS;
  const weeklyAverage = useMemo(() => {
    if (!productivityRatings.length) return 'n/a';
    const sum = productivityRatings.reduce((acc, item) => acc + (item.rating || 0), 0);
    return (sum / productivityRatings.length).toFixed(1);
  }, [productivityRatings]);

  const activeRating = ratingTouched ? rating : todayRating?.rating || 3;
  const activeRatingNote = ratingNoteTouched ? ratingNote : todayRating?.note || '';

  const handleSaveJournal = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await addJournalEntry({
        text: journalText,
        mood: journalMood,
        tags: journalTags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        prompts: promptResponse
      });

      setJournalText('');
      setPromptResponse('');
    } catch (err) {
      setError(err.message || 'Unable to save journal entry.');
    }
  };

  const handleSaveRating = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await saveDailyProductivity({ date: today, rating: activeRating, note: activeRatingNote });
    } catch (err) {
      setError(err.message || 'Unable to save productivity rating.');
    }
  };

  return (
    <div className="space-y-6">
      <section className="bg-[#161616] border border-gray-800 rounded-3xl p-6">
        <h2 className="text-2xl font-black text-[#a3e635] mb-1">Productivity Check-In</h2>
        <p className="text-sm text-gray-400 mb-4">Rate your day and write a short reflection.</p>

        {error && <p className="mb-4 text-sm text-red-300">{error}</p>}

        <form onSubmit={handleSaveRating} className="space-y-4 mb-6">
          <label className="block text-sm font-semibold text-gray-300" htmlFor="daily-rating">
            Daily productivity (1-5)
          </label>
          <input
            id="daily-rating"
            type="range"
            min="1"
            max="5"
            step="1"
            value={activeRating}
            onChange={(e) => {
              setRatingTouched(true);
              setRating(Number(e.target.value));
            }}
            className="w-full"
          />
          <p className="text-lg font-black text-white">{activeRating} / 5</p>
          <textarea
            value={activeRatingNote}
            onChange={(e) => {
              setRatingNoteTouched(true);
              setRatingNote(e.target.value);
            }}
            placeholder="Why this rating today?"
            className="w-full rounded-xl bg-[#0f0f0f] border border-gray-700 p-3 text-sm text-white"
            rows={3}
          />
          <button
            type="submit"
            className="bg-[#a3e635] text-black font-black px-5 py-2 rounded-xl hover:opacity-90"
          >
            Save Rating
          </button>
        </form>

        <form onSubmit={handleSaveJournal} className="space-y-4">
          <textarea
            value={journalText}
            onChange={(e) => setJournalText(e.target.value)}
            placeholder="Journal about your day, classes, and what felt hard or easy..."
            className="w-full rounded-xl bg-[#0f0f0f] border border-gray-700 p-3 text-sm text-white"
            rows={5}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select
              value={journalMood}
              onChange={(e) => setJournalMood(e.target.value)}
              className="rounded-xl bg-[#0f0f0f] border border-gray-700 p-3 text-sm text-white"
            >
              <option value="focused">Mood: Focused</option>
              <option value="tired">Mood: Tired</option>
              <option value="stressed">Mood: Stressed</option>
              <option value="calm">Mood: Calm</option>
              <option value="motivated">Mood: Motivated</option>
            </select>

            <input
              value={journalTags}
              onChange={(e) => setJournalTags(e.target.value)}
              placeholder="Tags (wins, challenge, gratitude)"
              className="rounded-xl bg-[#0f0f0f] border border-gray-700 p-3 text-sm text-white"
            />
          </div>

          <textarea
            value={promptResponse}
            onChange={(e) => setPromptResponse(e.target.value)}
            placeholder="Optional prompt: What is one thing you can improve tomorrow?"
            className="w-full rounded-xl bg-[#0f0f0f] border border-gray-700 p-3 text-sm text-white"
            rows={3}
          />

          <button
            type="submit"
            className="bg-white text-black font-black px-5 py-2 rounded-xl hover:opacity-90"
          >
            Save Journal Entry
          </button>
        </form>
      </section>

      <section className="bg-[#161616] border border-gray-800 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-black text-white">Recent Entries</h3>
          <span className="text-xs font-bold tracking-wider uppercase text-[#a3e635]">Avg Rating: {weeklyAverage}</span>
        </div>

        <div className="space-y-3">
          {journals.length === 0 && <p className="text-sm text-gray-400">No entries yet. Write your first reflection today.</p>}
          {journals.map((entry) => (
            <article key={entry.id} className="bg-[#0f0f0f] border border-gray-800 rounded-2xl p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs text-gray-500 mb-2">{entry.date} — {entry.mood}</p>
                <button
                  onClick={() => deleteJournalEntry(entry.id)}
                  className="text-gray-600 hover:text-red-400 transition-colors text-lg font-bold leading-none shrink-0"
                  aria-label="Delete journal entry"
                >
                  ×
                </button>
              </div>
              <p className="text-sm text-gray-200 whitespace-pre-wrap">{entry.text}</p>
              {Array.isArray(entry.tags) && entry.tags.length > 0 && (
                <p className="text-xs text-[#a3e635] mt-2">#{entry.tags.join(' #')}</p>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default ProductivityPanel;
