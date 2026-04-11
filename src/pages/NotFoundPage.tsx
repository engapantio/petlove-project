import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="pl-container pl-section">
    <h1 className="pl-heading-page">Page not found</h1>
    <p className="pl-text-muted">The page you are looking for does not exist or was moved.</p>
    <p>
      <Link to="/home" className="pl-btn pl-btn--primary">
        Back to home
      </Link>
    </p>
  </div>
);

export default NotFoundPage;
