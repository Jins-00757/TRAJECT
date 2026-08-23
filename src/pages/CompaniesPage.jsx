import { Link } from "react-router-dom";

export default function CompaniesPage() {
  return (
    <main>
      <h1>Companies</h1>
      <p>Browse the companies in your job search.</p>
      <Link to="/">Back to dashboard</Link>
    </main>
  );
}
