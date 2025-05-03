import { useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../store/auth-context";
import {
  HiHome,
  HiUsers,
  HiCurrencyDollar,
  HiChartBar,
  HiDocumentReport,
  HiMenu,
  HiX,
} from "react-icons/hi";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navigation = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: HiHome,
    },
    {
      name: "Users",
      path: "/dashboard/users",
      icon: HiUsers,
    },
    {
      name: "Revenue",
      path: "/dashboard/revenue",
      icon: HiCurrencyDollar,
    },
    {
      name: "Conversion",
      path: "/dashboard/conversion",
      icon: HiChartBar,
    },
    {
      name: "Cost",
      path: "/dashboard/cost",
      icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    {
      name: "Reports",
      path: "/dashboard/reports",
      icon: HiDocumentReport,
    },
  ];

  return (
    <div className="flex h-full bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <Link to="/dashboard" className="text-xl font-bold text-primary-600">
            Gymii Admin
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close sidebar"
          >
            <HiX className="w-6 h-6" />
          </button>
        </div>

        <nav className="px-4 py-4 overflow-y-auto">
          <ul className="space-y-2">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-2 text-sm rounded-md ${
                    location.pathname === item.path
                      ? "bg-primary-100 text-primary-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <item.icon
                    className={`w-5 h-5 mr-3 ${
                      location.pathname === item.path
                        ? "text-primary-700"
                        : "text-gray-500"
                    }`}
                  />
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:block md:w-64 md:flex-shrink-0">
        <div className="flex flex-col h-full bg-white border-r">
          <div className="flex items-center h-16 px-6 border-b">
            <Link
              to="/dashboard"
              className="text-xl font-bold text-primary-600"
            >
              Gymii Admin
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto">
            <nav className="px-4 py-4 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center px-4 py-2 text-sm rounded-md ${
                    location.pathname === item.path
                      ? "bg-primary-100 text-primary-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <item.icon
                    className={`w-5 h-5 mr-3 ${
                      location.pathname === item.path
                        ? "text-primary-700"
                        : "text-gray-500"
                    }`}
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 w-0">
        {/* Top header */}
        <header className="flex items-center justify-between h-16 px-4 bg-white border-b shadow-sm md:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-500 md:hidden"
            aria-label="Open sidebar"
          >
            <HiMenu className="w-6 h-6" />
          </button>

          <div className="flex items-center">
            <div className="mr-4 text-sm text-gray-700">
              {user?.name || "Admin User"}
            </div>
            <div className="relative">
              <button
                type="button"
                className="flex text-sm rounded-full focus:outline-none"
                id="user-menu-button"
                aria-label="User menu"
              >
                <img
                  className="w-8 h-8 rounded-full"
                  src={
                    user?.avatar ||
                    "https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff"
                  }
                  alt="User avatar"
                />
              </button>
              <button
                onClick={handleLogout}
                className="ml-3 text-sm text-primary-600 hover:underline"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
