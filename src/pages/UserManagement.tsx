import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import UserManagementTable from "../components/UserManagementTable";
import Pagination from "../components/Pagination";
import { useRawUserData, RawUser } from "../hooks/useKPI";

const ITEMS_PER_PAGE = 10;

export default function UserManagement() {
  const { data: rawUserData, isLoading, isError } = useRawUserData();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const users = useMemo(() => {
    if (!rawUserData) return [];
    return Object.values(rawUserData);
  }, [rawUserData]);

  // Apply search filtering to all users first
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;

    const lowerCaseSearch = searchTerm.toLowerCase();
    return users.filter(
      (user) =>
        (user.first_name?.toLowerCase() || "").includes(lowerCaseSearch) ||
        (user.email?.toLowerCase() || "").includes(lowerCaseSearch) ||
        (user.id?.toString() || "") == lowerCaseSearch
    );
  }, [users, searchTerm]);

  // Pagination logic - applied after filtering
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  // Reset to first page when search term changes
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleUserClick = (user: RawUser) => {
    console.log(user);
    navigate(`/dashboard/users/${user.id}`);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 p-4 rounded-md m-4">
        <h3 className="text-lg font-medium text-red-800">
          Error loading users
        </h3>
        <p className="mt-2 text-sm text-red-700">
          There was an error loading the user data. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage all users in the system.
          </p>
        </div>
      </div>

      <div className="mb-4 relative">
        <input
          type="text"
          placeholder="Search users..."
          className="w-full bg-white rounded-md border-0 py-2 pl-4 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <svg
            className="h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      <UserManagementTable
        users={paginatedUsers}
        onUserClick={handleUserClick}
      />

      {filteredUsers.length === 0 ? (
        <div className="py-10 text-center text-gray-500">
          No users found matching "{searchTerm}"
        </div>
      ) : (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredUsers.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
