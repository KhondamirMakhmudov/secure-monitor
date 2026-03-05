import Brand from "@/components/brand";
import Button from "@/components/button";
import Input from "@/components/input";
import { useState, useEffect } from "react";
import Image from "next/image";
import { signIn, useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import ContentLoader from "@/components/loader";
import Link from "next/link";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [savedLogins, setSavedLogins] = useState([]);

  // LocalStorage dan loginlarni olish
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("logins") || "[]");
    setSavedLogins(stored);
  }, []);

  // 🔥 Auto logout check
  useEffect(() => {
    if (!session?.expiresAt) return;

    const now = Date.now();
    const expiresAt = session.expiresAt;
    const timeout = expiresAt - now;

    if (timeout <= 0) {
      signOut({ callbackUrl: "/" });
    } else {
      const timer = setTimeout(() => {
        signOut({ callbackUrl: "/" });
      }, timeout);

      return () => clearTimeout(timer);
    }
  }, [session]);

  // Loginlarni saqlash
  const saveLogin = (username, password) => {
    let updated = [...savedLogins];
    const existingIndex = updated.findIndex((u) => u.username === username);
    if (existingIndex > -1) {
      updated[existingIndex].password = password;
    } else {
      updated.push({ username, password });
    }
    setSavedLogins(updated);
    localStorage.setItem("logins", JSON.stringify(updated));
  };

  const removeLogin = (username) => {
    const updated = savedLogins.filter((u) => u.username !== username);
    setSavedLogins(updated);
    localStorage.setItem("logins", JSON.stringify(updated));
  };

  const handleSelectLogin = (login) => {
    setUsername(login.username);
    setPassword(login.password);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    try {
      const response = await signIn("credentials", {
        username,
        password,
        redirect: false,
        callbackUrl: "/secure-section/",
      });

      if (response?.ok && !response?.error) {
        toast.success("Добро пожаловать");
        saveLogin(username, password);
        router.push("/secure-section/");
      } else {
        toast.error(
          "Login xato! " + (response?.error || "Noto‘g‘ri ma’lumot.")
        );
      }
    } catch (err) {
      toast.error("Tizimga kirishda xatolik yuz berdi.");
    } finally {
      setIsLoading(false);
    }
  };
  const handleExit = async () => {
    await signOut({ redirect: false });
    sessionStorage.clear();
    localStorage.clear();
    router.push("/");
  };

  return (
    <motion.div
      className="login h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {isLoading && (
        <div className="fixed inset-0 z-[9999] bg-white/80 backdrop-blur-sm flex items-center justify-center">
          <ContentLoader />
        </div>
      )}

      <div className="grid grid-cols-12 w-full gap-[30px] place-items-center">
        {/* Left side: Login form */}
        <div className="col-span-6 w-full flex flex-col items-center justify-center h-screen bg-white rounded-md p-[24px]">
          <motion.div
            className="max-w-[600px] flex flex-col items-start justify-center"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Brand />
            <div className="w-full h-[1px] bg-gray-200 my-[10px]" />

            <div className="mb-[20px]">
              <h1 className="text-[36px] mb-[12px] font-semibold">
                Вход в систему
              </h1>
              {status !== "authenticated" && (
                <p className="text-gray-400">
                  Для входа в систему введите ваше имя пользователя и пароль!
                </p>
              )}
            </div>

            {/* Agar login bo‘lgan bo‘lsa */}
            {status === "authenticated" ? (
              <div className="flex gap-4 w-full">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex-1"
                >
                  <Button sx={{ width: "100%" }}>
                    <Link href="/secure-section">Вход</Link>
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex-1"
                >
                  <Button
                    sx={{ width: "100%",  }}
                    onClick={handleExit}
                  >
                    Выйти
                  </Button>
                </motion.div>
              </div>
            ) : (
              // Login form
              <motion.form
                onSubmit={onSubmit}
                className="py-[20px] space-y-[10px] w-full"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                {/* Saved logins */}
                {savedLogins.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      Сохраненные логины:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {savedLogins.map((login, i) => (
                        <div
                          key={i}
                          onClick={() => handleSelectLogin(login)}
                          className="flex items-center gap-2 px-3 py-2 rounded-full bg-blue-50 text-blue-600 cursor-pointer hover:bg-blue-100 transition-all"
                        >
                          <span className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-500 text-white text-xs">
                            {login.username.charAt(0).toUpperCase()}
                          </span>
                          <span>{login.username}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeLogin(login.username);
                            }}
                            className="ml-1 text-red-400 hover:text-red-600"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Input
                  label="Имя пользователя"
                  type="text"
                  value={username}
                  inputClass="!h-[48px] rounded-[8px] !border-gray-300 text-[15px]"
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Введите имя пользователя"
                />
                <Input
                  label="Пароль"
                  type="password"
                  value={password}
                  inputClass="!h-[48px] rounded-[8px] !border-gray-300 text-[15px]"
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введите пароль"
                />

                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Button>Вход</Button>
                </motion.div>
              </motion.form>
            )}
          </motion.div>
        </div>

        {/* Right side: Illustration */}
        <motion.div
          className="col-span-6"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Image
            src="/icons/security-animate.svg"
            alt="login"
            width={600}
            height={300}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
