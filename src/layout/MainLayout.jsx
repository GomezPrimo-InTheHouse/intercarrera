import Navbar from "../components/navbar/Navbar";

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <Navbar />
      <main className="p-6">{children}</main>
    </div>
  );
};

export default MainLayout;
