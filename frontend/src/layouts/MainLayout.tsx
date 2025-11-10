import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../store";
import { logout } from "../features/user/userSlice";
import "./MainLayout.scss";

export default function MainLayout() {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <div className="main-layout">
      <nav className="navbar">
        <div className="navbar-content">
          <div className="navbar-brand">
            <NavLink
              to={user?.role === "admin" ? "/admin/dashboard" : "/rooms"}
            >
              Hotel Booking
            </NavLink>
          </div>

          <div className="navbar-links">
            {user?.role === "admin" ? (
              <>
                <NavLink
                  to="/admin/dashboard"
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/admin/rooms"
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                >
                  Manage Rooms
                </NavLink>
                <NavLink
                  to="/admin/bookings"
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                >
                  All Bookings
                </NavLink>
              </>
            ) : (
              <>
                <NavLink
                  to="/rooms"
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                >
                  Available Rooms
                </NavLink>
                <NavLink
                  to="/my-bookings"
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                >
                  My Bookings
                </NavLink>
              </>
            )}

            <div className="navbar-user">
              <span className="user-name">{user?.name}</span>
              <span className="user-role">({user?.role})</span>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
