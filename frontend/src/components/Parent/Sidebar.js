import Link from "next/link";
import { useRouter } from "next/router";

const ParentSidebar = () => {
  const router = useRouter();

  return (
    <div className="fixed top-0 left-0 h-screen w-64 bg-blue-800 text-white">
      <div className="p-4 text-center font-bold text-xl border-b border-blue-700">
        Parent Dashboard
      </div>
      <nav className="mt-4 h-[calc(100vh-4rem)] scroll-hidden overflow-y-auto">
        <ul className="space-y-2">
          <li>
            <Link
              href="/parent/account"
              className={`block py-2 px-4 ${
                router.pathname === "/parent/account"
                  ? "bg-blue-700"
                  : "hover:bg-blue-700"
              }`}
            >
              Account
            </Link>
          </li>
          <li>
            <Link
              href="/parent/change-password"
              className={`block py-2 px-4 ${
                router.pathname === "/parent/change-password"
                  ? "bg-blue-700"
                  : "hover:bg-blue-700"
              }`}
            >
              Change Password
            </Link>
          </li>
          <li>
            <Link
              href="/parent/message"
              className={`block py-2 px-4 ${
                router.pathname === "/parent/message"
                  ? "bg-blue-700"
                  : "hover:bg-blue-700"
              }`}
            >
              Messages
            </Link>
          </li>
          <li>
            <Link
              href="/parent/bulletin"
              className={`block py-2 px-4 ${
                router.pathname === "/parent/bulletin"
                  ? "bg-blue-700"
                  : "hover:bg-blue-700"
              }`}
            >
              Bulletins
            </Link>
          </li>
          <li>
            <Link
              href="/parent/performance-report"
              className={`block py-2 px-4 ${
                router.pathname === "/parent/performance-report"
                  ? "bg-blue-700"
                  : "hover:bg-blue-700"
              }`}
            >
              Performance Reports
            </Link>
          </li>
          <li>
            <Link
              href="/parent/attendance-report"
              className={`block py-2 px-4 ${
                router.pathname === "/parent/attendance-report"
                  ? "bg-blue-700"
                  : "hover:bg-blue-700"
              }`}
            >
              Attendance Reports
            </Link>
          </li>
          <li>
            <Link
              href="/parent/event"
              className={`block py-2 px-4 ${
                router.pathname === "/parent/event"
                  ? "bg-blue-700"
                  : "hover:bg-blue-700"
              }`}
            >
              Events
            </Link>
          </li>
          <li>
            <Link
              href="/parent/announcement"
              className={`block py-2 px-4 ${
                router.pathname === "/parent/announcement"
                  ? "bg-blue-700"
                  : "hover:bg-blue-700"
              }`}
            >
              Announcements
            </Link>
          </li>
          <li>
            <Link
              href="/parent/notification"
              className={`block py-2 px-4 ${
                router.pathname === "/parent/notification"
                  ? "bg-blue-700"
                  : "hover:bg-blue-700"
              }`}
            >
              Notifications
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default ParentSidebar;
