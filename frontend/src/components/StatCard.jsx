export default function StatCard({ label, value, sub, valueColor }) {
  return (
    <div className="bg-[#171717] border border-[#222] rounded-xl p-4">
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={valueColor ? { color: valueColor } : {}}>
        {value}
      </div>
      <div className="stat-sub">{sub}</div>
    </div>
  );
}
