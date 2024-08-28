import Link from 'next/link';

const AdminSidebar = () => {
  return (
    <div className="h-screen w-64 bg-blue-800 text-white">
      <div className="p-4 text-center font-bold text-xl border-b border-blue-700">
        Admin Dashboard
      </div>
      <nav className="mt-4">
        <ul className="space-y-2">
          <li>
            <Link href="/admin" className="block py-2 px-4 hover:bg-blue-700">
              Dashboard
            </Link>
          </li>
          <li>
            <Link href="/admin/users" className="block py-2 px-4 hover:bg-blue-700">
              Manage Users
            </Link>
          </li>
          <li>
            <Link href="/admin/settings" className="block py-2 px-4 hover:bg-blue-700">
              Settings
            </Link>
          </li>
          {/* Add more links as needed */}
        </ul>
      </nav>
    </div>
  );
};

export default AdminSidebar;
