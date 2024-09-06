import ParentSidebar from "./Sidebar";

const Layout = ({ children }) => {
  return (
    <div className="flex">
      <aside className="w-64 bg-gray-800 text-white h-screen">
        <ParentSidebar />
      </aside>

      <main className="flex-1 p-6 bg-gray-100 min-h-screen">
        {children}
      </main>
    </div>
  );
};

export default Layout;
