export default function Header({ month, onMonthChange, onAdd }) {
  return (
    <header className="header">
      <div className="header-title">
        <h1>Dashboard</h1>
        <p>Your spending overview</p>
      </div>
      <div className="header-actions">
        <input
          type="month"
          className="pill"
          value={month}
          onChange={(e) => e.target.value && onMonthChange(e.target.value)}
        />
        <button className="btn" onClick={onAdd}>+ Add transaction</button>
      </div>
    </header>
  );
}