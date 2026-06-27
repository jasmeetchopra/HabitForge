import { formatDate } from "../utils/date.js";

// Maps a completion count to one of 5 intensity buckets.
const level = (count) => {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count <= 4) return 3;
  return 4;
};

// GitHub-style contribution grid. Supports up to a 365-day view, a hover
// tooltip (native title), and an optional onDayClick for day detail.
export const CalendarHeatmap = ({ data = [], onDayClick }) => {
  return (
    <div>
      <div className="heatmap">
        {data.map((day) => (
          <button
            key={day.date}
            type="button"
            className={`heat-cell heat-${level(day.count)}${onDayClick ? " clickable" : ""}`}
            title={`${formatDate(day.date)} — ${day.count} completed`}
            onClick={onDayClick ? () => onDayClick(day) : undefined}
            aria-label={`${formatDate(day.date)}, ${day.count} completed`}
          />
        ))}
      </div>
      <div className="heat-legend">
        <span>Less</span>
        <span className="heat-cell heat-0" />
        <span className="heat-cell heat-1" />
        <span className="heat-cell heat-2" />
        <span className="heat-cell heat-3" />
        <span className="heat-cell heat-4" />
        <span>More</span>
      </div>
    </div>
  );
};
