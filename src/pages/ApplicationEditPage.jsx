import { Link, useParams } from "react-router-dom";

export default function ApplicationEditPage() {
  const { id } = useParams();

  return (
    <main>
      <h1>Edit application</h1>
      <p>Update application: {id}</p>
      <Link to={`/applications/${id}`}>Cancel</Link>
    </main>
  );
}
