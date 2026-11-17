import { Link } from 'react-router-dom';

export default function NavigateButton({ path, children }) {
  return <Link to={path} className="counter navigate-button">{children}</Link>;
}
