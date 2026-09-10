import Link from "next/link";

export default function NotFound() {
  return (
    <div className="error-page">
      <p className="eyebrow">END OF TAPE</p>
      <h1>
        There is nothing <em>here.</em>
      </h1>
      <Link className="btn-outline" href="/">
        Back to the conference
      </Link>
    </div>
  );
}
