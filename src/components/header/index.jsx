import Brand from "../brand";
import { signOut } from "next-auth/react";
import ExitModal from "../modal/exit-modal";
import { useState } from "react";
import ThemeSwitcher from "../theme-select";
import Link from "next/link";
import { useRouter } from "next/router";

const Header = ({ bgColor = "bg-white" }) => {
  const router = useRouter();
  const [openExitModal, setOpenExitModal] = useState(false);

  const handleLogout = () => {
    signOut({ redirect: true, callbackUrl: "http://10.20.6.30:3000" });
  };

  const handleOpenExitModal = () => setOpenExitModal(false);

  const navLinks = [
    { href: "/secure-section", label: "Система контроля доступа" },
    { href: "/late-comers", label: "Отчёты" },
  ];

  return (
    <div className="w-full">
      <header
        className={`w-full ${bgColor} py-4 px-4 rounded-md flex justify-between items-center shadow`}
      >
        <Brand />
        <nav>
          <ul className="flex gap-6">
            {navLinks.map(({ href, label }) => {
              const isActive = router.pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={`relative transition duration-300 
                      ${
                        isActive
                          ? "text-blue-600 font-medium"
                          : " hover:text-blue-600"
                      }
                      after:content-[''] after:absolute after:left-1/2 after:bottom-0 
                      after:h-[2px] after:w-0 after:bg-blue-600 
                      after:transition-all after:duration-300 after:-translate-x-1/2
                      hover:after:w-full ${isActive ? "after:w-full" : ""}`}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          <button
            onClick={() => setOpenExitModal(true)}
            className="text-sm bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
          >
            Выход
          </button>
        </div>
        <ExitModal
          open={openExitModal}
          onClose={handleOpenExitModal}
          handleLogout={handleLogout}
        />
      </header>

      {/* Marquee */}
      <div className="w-full bg-yellow-100 text-yellow-800 py-1 mt-2 rounded">
        <marquee behavior="scroll" direction="left">
          Сайт работает в тестовом режиме
        </marquee>
      </div>
    </div>
  );
};

export default Header;
