import Link from "next/link";
import { useRouter } from "next/router";

const TeacherSidebar = () => {
  const router = useRouter();

  return (
    <div className="fixed top-0 left-0 h-screen w-64 bg-blue-800 text-white">
      <div className="p-4 text-center font-bold text-xl border-b border-blue-700">
        Teacher Dashboard
      </div>
      <nav className="mt-4 h-[calc(100vh-4rem)] scroll-hidden overflow-y-auto">
        <ul className="space-y-2">
          <li>
            <Link
              href="/teacher/account"
              className={`block py-2 px-4 ${
                router.pathname === "/teacher/account"
                  ? "bg-blue-700"
                  : "hover:bg-blue-700"
              }`}
            >
              Account
            </Link>
          </li>
          <li>
            <Link
              href="/teacher/change-password"
              className={`block py-2 px-4 ${
                router.pathname === "/teacher/change-password"
                  ? "bg-blue-700"
                  : "hover:bg-blue-700"
              }`}
            >
              Change Password
            </Link>
          </li>
          <li>
            <Link
              href="/teacher/message"
              className={`block py-2 px-4 ${
                router.pathname === "/teacher/message"
                  ? "bg-blue-700"
                  : "hover:bg-blue-700"
              }`}
            >
              Messages
            </Link>
          </li>
          <li>
            <Link
              href="/teacher/absence"
              className={`block py-2 px-4 ${
                router.pathname === "/teacher/absence"
                  ? "bg-blue-700"
                  : "hover:bg-blue-700"
              }`}
            >
              Absences
            </Link>
          </li>
          <li>
            <Link
              href="/teacher/grade"
              className={`block py-2 px-4 ${
                router.pathname === "/teacher/grade"
                  ? "bg-blue-700"
                  : "hover:bg-blue-700"
              }`}
            >
              Grades
            </Link>
          </li>
          <li>
            <Link
              href="/teacher/timetable"
              className={`block py-2 px-4 ${
                router.pathname === "/teacher/timetable"
                  ? "bg-blue-700"
                  : "hover:bg-blue-700"
              }`}
            >
              Timetable
            </Link>
          </li>
          <li>
            <Link
              href="/teacher/event"
              className={`block py-2 px-4 ${
                router.pathname === "/teacher/event"
                  ? "bg-blue-700"
                  : "hover:bg-blue-700"
              }`}
            >
              Events
            </Link>
          </li>
          <li>
            <Link
              href="/teacher/announcement"
              className={`block py-2 px-4 ${
                router.pathname === "/teacher/announcement"
                  ? "bg-blue-700"
                  : "hover:bg-blue-700"
              }`}
            >
              Announcements
            </Link>
          </li>
          <li>
            <Link
              href="/teacher/notification"
              className={`block py-2 px-4 ${
                router.pathname === "/teacher/notification"
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

export default TeacherSidebar;
