import { Link } from "react-router-dom";

// Home component serves as the landing page for the application
export default function Home() {
  return (
    <div className="home-page-container">
      {/* Hero section containing the main landing page content */}
      <section className="hero-section">
        <div className="container">
          <h1 className="title">IIE Issues</h1>

          {/* Visual divider */}
          <hr className="divider" />

          {/* Application description */}
          <p className="description">
            A dedicated platform for students and staff to quickly report
            technical and campus issues. From computer problems to general
            maintenance, raise a request here for fast resolution.
          </p>

          {/* Action buttons directing users to the login page */}
          <div className="button-group">
            {/* Student login button */}
            <Link to="/login" className="btn btn-outline">
              Student Login
            </Link>

            {/* Admin login button */}
            <Link to="/login" className="btn btn-solid">
              Faculty Login
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
