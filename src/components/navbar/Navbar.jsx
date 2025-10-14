import { Link } from "react-router-dom";
import LoginButton from "../button/LoginButton";

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-blue-600">
          🧠 MyApp
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/" className="hover:text-blue-600">Inicio</Link>
          <Link to="/dashboard" className="hover:text-blue-600">Dashboard</Link>
          <LoginButton />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
