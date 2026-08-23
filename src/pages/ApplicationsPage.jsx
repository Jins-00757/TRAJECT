import { Link } from "react-router-dom";

export default function ApplicationsPage() {
  return (
    <main>
      <h1>Applications</h1>
      <p>Review and manage your job applications.</p>
      <Link to="/applications/new">Add application</Link>
    </main>
  );
}
