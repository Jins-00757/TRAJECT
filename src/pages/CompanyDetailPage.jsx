import { Link, useParams } from "react-router-dom";

export default function CompanyDetailPage() {
  const { id } = useParams();

  return (
    <main>
      <h1>Company details</h1>
      <p>Company: {id}</p>
      <Link to="/companies">Back to companies</Link>
    </main>
  );
}
