/** A thin progress line across the top of the screen, filled by page progress (--gp). */
export function TripBar() {
  return (
    <div className="hud-trip" aria-hidden="true">
      <div className="hud-trip__fill" />
    </div>
  )
}
