import { Link, useParams } from "react-router-dom";

export default function ApplicationDetailPage() {
  const { id } = useParams();

  return (
    <main>
      <h1>Application details</h1>
      <p>Application: {id}</p>
      <Link to={`/applications/${id}/edit`}>Edit application</Link>
    </main>
  );
}
