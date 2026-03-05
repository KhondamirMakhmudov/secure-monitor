import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Hydrate, QueryClientProvider } from "@tanstack/react-query";
import ClientOnlyToaster from "@/components/toast";
import { SessionProvider } from "next-auth/react";
import reactQueryClient from "@/config/react-query";

import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider as NextThemesProvider } from "next-themes"; // qo‘shildi
import "@/styles/globals.css";
import "@/styles/loader.css";

import Layout from "@/components/layout";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  const [queryClient] = useState(() => reactQueryClient);
  const router = useRouter();

  const isHomePage = router.pathname === "/";

  // next-themes ichidan hozirgi theme ni olish uchun state
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Server Side Rendering da mismatch oldini olish uchun

  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        <Hydrate state={pageProps?.dehydratedState}>
          <NextThemesProvider
            attribute="class"
            defaultTheme="dark"
            value={{ light: "light", dark: "dark" }}
            onChange={(theme) => setMode(theme)}
          >
            <CssBaseline />
            {isHomePage ? (
              <Component {...pageProps} />
            ) : (
              <Layout bgColor={pageProps.bgColor} headerBg={pageProps.headerBg}>
                <Component {...pageProps} />
              </Layout>
            )}


            <ClientOnlyToaster />
          </NextThemesProvider>
        </Hydrate>
      </QueryClientProvider>
    </SessionProvider>
  );
}
