import Link from "next/link";
import { useRouter } from "next/router";

const StudentSidebar = () => {
  const router = useRouter();

  return (
    <div className="fixed top-0 left-0 h-screen w-64 bg-blue-800 text-white">
      <div className="p-4 text-center font-bold text-xl border-b border-blue-700">
        Student Dashboard
      </div>
      <nav className="mt-4 h-[calc(100vh-4rem)] scroll-hidden overflow-y-auto">
        <ul className="space-y-2">
          <li>
            <Link
              href="/student/account"
              className={`block py-2 px-4 ${
                router.pathname === "/student/account"
                  ? "bg-blue-700"
                  : "hover:bg-blue-700"
              }`}
            >
              Account
            </Link>
          </li>
          <li>
            <Link
              href="/student/change-password"
              className={`block py-2 px-4 ${
                router.pathname === "/student/change-password"
                  ? "bg-blue-700"
                  : "hover:bg-blue-700"
              }`}
            >
              Change Password
            </Link>
          </li>
          <li>
            <Link
              href="/student/paiement"
              className={`block py-2 px-4 ${
                router.pathname === "/student/paiement"
                  ? "bg-blue-700"
                  : "hover:bg-blue-700"
              }`}
            >
              Paiement
            </Link>
          </li>
          <li>
            <Link
              href="/student/attendance-report"
              className={`block py-2 px-4 ${
                router.pathname === "/student/attendance-report"
                  ? "bg-blue-700"
                  : "hover:bg-blue-700"
              }`}
            >
              Attendance Report
            </Link>
          </li>
          <li>
            <Link
              href="/student/performance-report"
              className={`block py-2 px-4 ${
                router.pathname === "/student/performance-report"
                  ? "bg-blue-700"
                  : "hover:bg-blue-700"
              }`}
            >
              Performance Report
            </Link>
          </li>
          <li>
            <Link
              href="/student/bulletin"
              className={`block py-2 px-4 ${
                router.pathname === "/student/bulletin"
                  ? "bg-blue-700"
                  : "hover:bg-blue-700"
              }`}
            >
              Bulletin
            </Link>
          </li>
          <li>
            <Link
              href="/student/timetable"
              className={`block py-2 px-4 ${
                router.pathname === "/student/timetable"
                  ? "bg-blue-700"
                  : "hover:bg-blue-700"
              }`}
            >
              Timetable
            </Link>
          </li>
          <li>
            <Link
              href="/student/event"
              className={`block py-2 px-4 ${
                router.pathname === "/student/event"
                  ? "bg-blue-700"
                  : "hover:bg-blue-700"
              }`}
            >
              Events
            </Link>
          </li>
          <li>
            <Link
              href="/student/announcement"
              className={`block py-2 px-4 ${
                router.pathname === "/student/announcement"
                  ? "bg-blue-700"
                  : "hover:bg-blue-700"
              }`}
            >
              Announcements
            </Link>
          </li>
          <li>
            <Link
              href="/student/notification"
              className={`block py-2 px-4 ${
                router.pathname === "/student/notification"
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

export default StudentSidebar;
