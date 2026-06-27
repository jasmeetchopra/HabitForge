import {
  ResponsiveContainer,
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

// Shared theme tokens so charts match the forge palette.
const EMBER = "#ff7a3c";
const EMBER_SOFT = "#ff9f55";
const GREEN = "#43d17f";
const RED = "#ef5c5c";
const GRID = "#282d36";
const MUTED = "#8c93a0";

const tooltipStyle = {
  background: "#1c2027",
  border: "1px solid #353b46",
  borderRadius: 9,
  color: "#e7e9ec",
  fontSize: 13,
};

// Per-habit consistency — bar chart.
export const ConsistencyBarChart = ({ data = [] }) => {
  if (!data.length) return <p style={{ color: MUTED }}>No habit data yet.</p>;
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey="title" tick={{ fill: MUTED, fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={50} />
        <YAxis tick={{ fill: MUTED, fontSize: 11 }} domain={[0, 100]} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,122,60,0.08)" }} formatter={(v) => [`${v}%`, "Consistency"]} />
        <Bar dataKey="score" fill={EMBER} radius={[5, 5, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

// Daily completions over the last 30 days — line chart.
export const TrendLineChart = ({ data = [] }) => {
  if (!data.length) return <p style={{ color: MUTED }}>No activity yet.</p>;
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -22 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey="label" tick={{ fill: MUTED, fontSize: 10 }} interval={6} />
        <YAxis tick={{ fill: MUTED, fontSize: 11 }} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v) => [v, "Completed"]} />
        <Line type="monotone" dataKey="completed" stroke={EMBER} strokeWidth={2}
          dot={false} activeDot={{ r: 4, fill: EMBER_SOFT }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

// Today's scheduled habits: done vs remaining — pie chart.
export const CompletionPieChart = ({ done = 0, remaining = 0 }) => {
  const data = [
    { name: "Done", value: done },
    { name: "Remaining", value: remaining },
  ];
  if (done + remaining === 0) return <p style={{ color: MUTED }}>Nothing scheduled today.</p>;
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
          <Cell fill={GREEN} />
          <Cell fill={GRID} />
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
      </PieChart>
    </ResponsiveContainer>
  );
};
