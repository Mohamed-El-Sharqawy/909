import { Search } from "lucide-react";
import { USER_ROLES } from "@ecommerce/shared-utils";

export function UsersPage() {
  return (
    <div>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <p className="mt-1 text-muted-foreground">
          Manage platform users and roles.
        </p>
      </div>

      {/* Filters */}
      <div className="mt-6 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users..."
            className="w-full rounded-md border border-input bg-background py-2 pl-10 pr-4 text-sm"
          />
        </div>
        <select className="rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="">All Roles</option>
          {USER_ROLES.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>

      {/* Users Table */}
      <div className="mt-6 rounded-lg border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Role</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Joined</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">
                No users found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
