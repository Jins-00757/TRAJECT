import { Link } from "react-router-dom";

export default function ApplicationNewPage() {
  return (
    <main>
      <h1>New application</h1>
      <p>Add a job application to your tracker.</p>
      <Link to="/applications">Back to applications</Link>
    </main>
  );
}
