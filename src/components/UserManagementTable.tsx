import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { RawUser } from "../hooks/useKPI";
import { format } from "date-fns";

interface UserManagementTableProps {
  users: RawUser[];
  onUserClick?: (user: RawUser) => void;
}

export default function UserManagementTable({
  users,
  onUserClick,
}: UserManagementTableProps) {
  return (
    <div className="space-y-4">
      <ul
        role="list"
        className="divide-y divide-gray-100 rounded-md border border-gray-200 shadow-sm"
      >
        {users.length > 0 ? (
          users.map((user) => (
            <li
              key={user.id}
              className="relative py-5 hover:bg-gray-50 cursor-pointer"
              onClick={() => onUserClick && onUserClick(user)}
            >
              <div className="px-4 sm:px-6 lg:px-8">
                <div className="mx-auto flex max-w-4xl justify-between gap-x-6">
                  <div className="flex min-w-0 gap-x-4">
                    <div className="size-12 flex-none rounded-full bg-gray-50 flex items-center justify-center text-lg font-semibold text-gray-500">
                      {user.first_name && user.first_name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-auto">
                      <p className="text-sm/6 font-semibold text-gray-900">
                        <span className="absolute inset-x-0 -top-px bottom-0" />
                        {user.first_name}
                      </p>
                      <p className="mt-1 flex text-xs/5 text-gray-500">
                        <span className="relative truncate">{user.email}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-x-4">
                    <div className="hidden sm:flex sm:flex-col sm:items-end">
                      <p className="text-sm/6 text-gray-900">
                        {user.auto_renew_enabled
                          ? "Active Subscriber"
                          : "Free User"}
                      </p>
                      {user.last_active ? (
                        <p className="mt-1 text-xs/5 text-gray-500">
                          Last seen{" "}
                          <time dateTime={user.last_active}>
                            {format(new Date(user.last_active), "MMM d, yyyy")}
                          </time>
                        </p>
                      ) : (
                        <div className="mt-1 flex items-center gap-x-1.5">
                          <div className="flex-none rounded-full bg-emerald-500/20 p-1">
                            <div className="size-1.5 rounded-full bg-emerald-500" />
                          </div>
                          <p className="text-xs/5 text-gray-500">New User</p>
                        </div>
                      )}
                    </div>
                    <ChevronRightIcon
                      aria-hidden="true"
                      className="size-5 flex-none text-gray-400"
                    />
                  </div>
                </div>
              </div>
            </li>
          ))
        ) : (
          <li className="py-10 text-center text-gray-500">
            No users to display
          </li>
        )}
      </ul>
    </div>
  );
}
