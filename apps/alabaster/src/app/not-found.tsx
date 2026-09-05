import Link from "next/link";

export default function NotFound() {
  return (
    <div className="error-page">
      <p className="eyebrow">Not found</p>
      <h1 className="display">
        There is nothing <em>here.</em>
      </h1>
      <Link className="btn btn-outline" href="/">
        Back to the conference
      </Link>
      <style>{`
        .error-page {
          min-height: 80svh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
          padding: 10vh 6vw;
          text-align: center;
        }
      `}</style>
    </div>
  );
}
