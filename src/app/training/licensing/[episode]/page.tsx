/**
 * Licensing Training Episode Page
 *
 * Public access - no login required
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getLicensingTrainingByDay } from '@/lib/training/licensing-series-content';

export default async function LicensingEpisodePage({ params }: { params: Promise<{ episode: string }> }) {
  const { episode: episodeParam } = await params;
  const episodeNum = parseInt(episodeParam);

  if (isNaN(episodeNum) || episodeNum < 1 || episodeNum > 14) {
    notFound();
  }

  const episode = getLicensingTrainingByDay(episodeNum);

  if (!episode) {
    notFound();
  }

  const prevEpisode = episodeNum > 1 ? episodeNum - 1 : null;
  const nextEpisode = episodeNum < 14 ? episodeNum + 1 : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header with Apex Logo */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="https://reachtheapex.net" className="flex items-center gap-3">
            <Image
              src="/apex-logo.png"
              alt="Apex Affinity Group"
              width={180}
              height={50}
              className="h-12 w-auto"
              priority
            />
          </Link>
          <Link
            href="/dashboard"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Go to Dashboard →
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Episode Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {episode.category.toUpperCase().replace('-', ' ')}
            </span>
            <span className="text-sm text-slate-600">
              Episode {episodeNum} of 14
            </span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            {episode.title}
          </h1>
          <p className="text-slate-600">
            🎓 Get Licensed Series • {episode.duration} minutes
          </p>
        </div>

        {/* Audio Player Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 mb-8 shadow-xl">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">🎧</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Listen to Episode {episodeNum}
            </h2>
            <p className="text-slate-300">
              {episode.duration} minutes • Professional narration
            </p>
          </div>

          {/* Audio Player */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <audio
              controls
              className="w-full"
              style={{
                height: '54px',
                filter: 'invert(1) hue-rotate(180deg)'
              }}
            >
              <source src={`/audio/licensing/episode-${episodeNum}.mp3`} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              Can't play audio? <Link href="#transcript" className="text-blue-400 hover:text-blue-300 underline">Read the transcript below</Link>
            </p>
          </div>
        </div>

        {/* Action Item */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-8 mb-8 text-white shadow-xl">
          <div className="flex items-start gap-4">
            <div className="text-4xl">🎯</div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">Today's Action Item</h3>
              <p className="text-green-50 text-lg leading-relaxed">
                {episode.actionItem}
              </p>
            </div>
          </div>
        </div>

        {/* Key Takeaways */}
        <div className="bg-white rounded-2xl p-8 mb-8 shadow-lg">
          <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span>💡</span> Key Takeaways
          </h3>
          <ul className="space-y-3">
            {episode.keyTakeaways.map((takeaway, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </span>
                <span className="text-slate-700 leading-relaxed">{takeaway}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Resources (if available) */}
        {episode.resources && episode.resources.length > 0 && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-8 mb-8">
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span>📚</span> Resources
            </h3>
            <ul className="space-y-2">
              {episode.resources.map((resource, index) => (
                <li key={index} className="text-slate-700">
                  • {resource}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Transcript */}
        <div id="transcript" className="bg-white rounded-2xl p-8 mb-8 shadow-lg">
          <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span>📝</span> Full Transcript
          </h3>
          <div className="prose prose-slate max-w-none">
            {episode.script.split('\n\n').map((paragraph, index) => (
              <p key={index} className="text-slate-700 leading-relaxed mb-4">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mb-8">
          {prevEpisode ? (
            <Link
              href={`/training/licensing/${prevEpisode}`}
              className="flex items-center gap-2 px-6 py-3 bg-white rounded-xl shadow-md hover:shadow-lg transition-all text-slate-700 hover:text-slate-900 font-medium"
            >
              <span>←</span> Episode {prevEpisode}
            </Link>
          ) : (
            <div></div>
          )}

          {nextEpisode ? (
            <Link
              href={`/training/licensing/${nextEpisode}`}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl shadow-md hover:shadow-lg hover:bg-green-700 transition-all font-medium"
            >
              Episode {nextEpisode} <span>→</span>
            </Link>
          ) : (
            <div className="px-6 py-3 bg-green-100 text-green-800 rounded-xl font-medium">
              🎉 Series Complete! (More episodes coming)
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">Your Progress</span>
            <span className="text-sm font-bold text-green-600">
              {episodeNum} of 14 episodes ({Math.round((episodeNum / 14) * 100)}%)
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${(episodeNum / 14) * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {14 - episodeNum} episodes remaining • Complete the series to get certified!
          </p>
        </div>

        {/* Call to Action */}
        <div className="mt-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 text-white text-center shadow-xl">
          <h3 className="text-2xl font-bold mb-3">Ready to Get Licensed?</h3>
          <p className="text-blue-100 mb-6">
            Join Apex Affinity Group and start earning 2-5x more with your insurance license
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg"
          >
            Join Apex Today
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8 mt-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm">
            © 2026 Apex Affinity Group • Get Licensed Series
          </p>
          <p className="text-slate-500 text-xs mt-2">
            Questions? <a href="mailto:support@theapexway.net" className="text-blue-400 hover:text-blue-300">Contact Support</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
