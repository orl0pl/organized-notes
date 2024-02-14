import "@/styles/globals.css";
import { appWithTranslation } from "next-i18next";
import { ThemeProvider } from "next-themes";
import type { AppProps } from "next/app";
import { Roboto } from "next/font/google";
const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500", "700"] });

export function App({ Component, pageProps }: AppProps) {
	return (
		<ThemeProvider
			attribute="class"
			themes={[
				"green-light",
				"green-light-medium-contrast",
				"green-light-high-contrast",
				"green-dark",
				"green-dark-medium-contrast",
				"green-dark-high-contrast",
			]}
		>
			<div className={roboto.className}>
				<Component {...pageProps} />
			</div>
		</ThemeProvider>
	);
}

export default appWithTranslation(App)
