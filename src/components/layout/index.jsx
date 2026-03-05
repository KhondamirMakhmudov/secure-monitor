import { useTheme } from "next-themes";
import Header from "../header";

const Layout = ({ children, bgColor = "", headerBg }) => {
  const { theme } = useTheme();

  const isDarkMode = theme === "dark";

  return (
    <div className={`min-h-scree  ${isDarkMode ? "dark" : ""}`}>
      <div className="container mx-auto py-6 px-4">
        <Header bgColor={headerBg} />
        {children}
      </div>
    </div>
  );
};

export default Layout;
