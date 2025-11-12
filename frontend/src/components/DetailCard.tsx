import Card from "./Card";
import "./DetailCard.scss";

interface DetailItem {
  label: string;
  value: string | number;
}

interface DetailCardProps {
  title: string;
  items: DetailItem[];
}

export default function DetailCard({ title, items }: DetailCardProps) {
  return (
    <Card className="detail-card">
      <h2 className="detail-title">{title}</h2>
      <div className="detail-list">
        {items.map((item, idx) => (
          <div className="detail-item" key={idx}>
            <span className="detail-label">{item.label}</span>
            <span className="detail-value">{item.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
