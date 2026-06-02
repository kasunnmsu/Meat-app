import Link from "next/link";

export default function HomePage() {
  return (
    <main className="home-page">
      <section className="home-card">
        <div className="home-header">
          <div className="badge">Research App</div>
          <h1>Beef Choice Study</h1>
          <p>
            Start a new participant survey. One unique participant ID will be used
            across all three sessions.
          </p>
        </div>

        <div className="single-start-wrap">
          <Link href="/participant/start?mode=survey" className="big-start-button">
            <span>Start New Survey</span>
            <small>Session 1 → Session 2 → Session 3</small>
          </Link>
        </div>

        <div className="admin-session-links">
          <Link href="/participant/start?next=/session-1">Start Session 1 only</Link>
          <Link href="/participant/start?next=/session-2/descriptions">Start Session 2 only</Link>
          <Link href="/participant/start?next=/session-3">Start Session 3 only</Link>
        </div>
      </section>
    </main>
  );
}
