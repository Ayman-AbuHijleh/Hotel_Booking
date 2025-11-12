import Card from "./Card";
import "./DashboardCard.scss";

interface DashboardCardProps {
  icon: string;
  value: number | string;
  label: string;
  colorClass: string;
}

export default function DashboardCard({
  icon,
  value,
  label,
  colorClass,
}: DashboardCardProps) {
  return (
    <Card className="stat-card">
      <div className={`stat-icon ${colorClass}`}>{icon}</div>
      <div className="stat-content">
        <h3 className="stat-value">{value}</h3>
        <p className="stat-label">{label}</p>
      </div>
    </Card>
  );
}
