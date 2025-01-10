const DASHBOARD_URL = process.env.DASHBOARD_URL ?? "";

export default function DashboardPage() {
  return (
    <div className="container p-0">
      <iframe src={DASHBOARD_URL} width="1920px" height="1080px"></iframe>
    </div>
  );
}
