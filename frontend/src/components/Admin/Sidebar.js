import Link from "next/link";
import { useRouter } from "next/router";

const AdminSidebar = () => {
  const router = useRouter();

  return (
    <div className="fixed top-0 left-0 h-screen w-64 bg-blue-800 text-white">
      <div className="p-4 text-center font-bold text-xl border-b border-blue-700">
        Headmaster Dashboard
      </div>
      <nav className="mt-4 h-[calc(100vh-4rem)] scroll-hidden overflow-y-auto">
        <ul className="space-y-2">
          <li>
            <Link
              href="/admin/dashboard"
              className={`block py-2 px-4 ${
                router.pathname === "/admin/dashboard"
                  ? "bg-blue-700"
                  : "hover:bg-blue-700"
              }`}
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              href="/admin/account"
              className={`block py-2 px-4 ${
                router.pathname === "/admin/account"
                  ? "bg-blue-700"
                  : "hover:bg-blue-700"
              }`}
            >
              Account
            </Link>
          </li>
          <li>
            <Link
              href="/admin/change-password"
              className={`block py-2 px-4 ${
                router.pathname === "/admin/change-password"
                  ? "bg-blue-700"
                  : "hover:bg-blue-700"
              }`}
            >
              Change Password
            </Link>
          </li>
          <li>
            <Link
              href="/admin/message"
              className={`block py-2 px-4 ${
                router.pathname === "/admin/message"
                  ? "bg-blue-700"
                  : "hover:bg-blue-700"
              }`}
            >
              Messages
            </Link>
          </li>
          <li>
            <Link
              href="/admin/student"
              className={`block py-2 px-4 ${
                router.pathname === "/admin/student"
                  ? "bg-blue-700"
                  : "hover:bg-blue-700"
              }`}
            >
              Students
            </Link>
          </li>
          <li>
            <Link
              href="/admin/parent"
              className={`block py-2 px-4 ${
                router.pathname === "/admin/parent"
                  ? "bg-blue-700"
                  : "hover:bg-blue-700"
              }`}
            >
              Parents
            </Link>
          </li>
          <li>
            <Link
              href="/admin/teacher"
              className={`block py-2 px-4 ${
                router.pathname === "/admin/teacher"
                  ? "bg-blue-700"
                  : "hover:bg-blue-700"
              }`}
            >
              Teachers
            </Link>
          </li>
          <li>
            <Link
              href="/admin/inscription"
              className={`block py-2 px-4 ${
                router.pathname === "/admin/inscription"
                  ? "bg-blue-700"
                  : "hover:bg-blue-700"
              }`}
            >
              Inscriptions
            </Link>
          </li>
          <li>
            <Link
              href="/admin/absence"
              className={`block py-2 px-4 ${
                router.pathname === "/admin/absence"
                  ? "bg-blue-700"
                  : "hover:bg-blue-700"
              }`}
            >
              Absences
            </Link>
          </li>
          <li>
            <Link
              href="/admin/classroom"
              className={`block py-2 px-4 ${
                router.pathname === "/admin/classroom"
                  ? "bg-blue-700"
                  : "hover:bg-blue-700"
              }`}
            >
              Classrooms
            </Link>
          </li>
          <li>
            <Link
              href="/admin/class"
              className={`block py-2 px-4 ${
                router.pathname === "/admin/class"
                  ? "bg-blue-700"
                  : "hover:bg-blue-700"
              }`}
            >
              Classes
            </Link>
          </li>
          <li>
            <Link
              href="/admin/subject"
              className={`block py-2 px-4 ${
                router.pathname === "/admin/subject"
                  ? "bg-blue-700"
                  : "hover:bg-blue-700"
              }`}
            >
              Subjects
            </Link>
          </li>
          <li>
            <Link
              href="/admin/course"
              className={`block py-2 px-4 ${
                router.pathname === "/admin/course"
                  ? "bg-blue-700"
                  : "hover:bg-blue-700"
              }`}
            >
              Courses
            </Link>
          </li>
          <li>
            <Link
              href="/admin/student-timetable"
              className={`block py-2 px-4 ${
                router.pathname === "/admin/student-timetable"
                  ? "bg-blue-700"
                  : "hover:bg-blue-700"
              }`}
            >
              Students' Timetables
            </Link>
          </li>
          <li>
            <Link
              href="/admin/teacher-timetable"
              className={`block py-2 px-4 ${
                router.pathname === "/admin/teacher-timetable"
                  ? "bg-blue-700"
                  : "hover:bg-blue-700"
              }`}
            >
              Teachers' Timetables
            </Link>
          </li>
          <li>
            <Link
              href="/admin/bulletin"
              className={`block py-2 px-4 ${
                router.pathname === "/admin/bulletin"
                  ? "bg-blue-700"
                  : "hover:bg-blue-700"
              }`}
            >
              Bulletins
            </Link>
          </li>
          <li>
            <Link
              href="/admin/report"
              className={`block py-2 px-4 ${
                router.pathname === "/admin/report"
                  ? "bg-blue-700"
                  : "hover:bg-blue-700"
              }`}
            >
              Reports
            </Link>
          </li>
          <li>
            <Link
              href="/admin/event"
              className={`block py-2 px-4 ${
                router.pathname === "/admin/event"
                  ? "bg-blue-700"
                  : "hover:bg-blue-700"
              }`}
            >
              Events
            </Link>
          </li>
          <li>
            <Link
              href="/admin/announcement"
              className={`block py-2 px-4 ${
                router.pathname === "/admin/announcement"
                  ? "bg-blue-700"
                  : "hover:bg-blue-700"
              }`}
            >
              Announcements
            </Link>
          </li>
          <li>
            <Link
              href="/admin/notification"
              className={`block py-2 px-4 ${
                router.pathname === "/admin/notification"
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

export default AdminSidebar;
