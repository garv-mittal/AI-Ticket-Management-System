import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const token = localStorage.getItem("token");
  let user = localStorage.getItem("user");
  if (user) {
    user = JSON.parse(user);
  }
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="navbar bg-base-100 shadow-md px-6 py-3">
      <div className="flex-1">
        <Link to="/" className="text-2xl font-bold text-primary ">
          Ticket AI
        </Link>
      </div>
      <div className="flex items-center gap-4">
        {!token ? (
          <>
            <Link to="/signup" className="btn btn-outline btn-md rounded-md text-base">
              Signup
            </Link>
            <Link to="/login" className="btn btn-primary btn-md rounded-md text-base">
              Login
            </Link>
          </>
        ) : (
          <>
            <span className="text-sm text-gray-500">Hi, {user?.email}</span>
            {user?.role === "admin" && (
              <Link to="/admin" className="btn btn-warning btn-sm rounded-md">
                Admin
              </Link>
            )}
            <button
              onClick={logout}
              className="btn btn-error btn-sm rounded-md"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
}
