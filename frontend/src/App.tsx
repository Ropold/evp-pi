import { useEffect, useState } from "react";
import "./App.css";
import "./components/styles/Buttons.css";
import Footer from "./components/Footer.tsx";
import Navbar from "./components/Navbar.tsx";
import NotFound from "./components/NotFound.tsx";
import Exam from "./components/practice/Exam.tsx";
import Practice from "./components/practice/Practice.tsx";
import ProgressOverview from "./components/practice/ProgressOverview.tsx";
import TerminalFreeMode from "./components/terminal/TerminalFreeMode.tsx";
import Welcome from "./components/Welcome.tsx";

/** Einfaches Hash-Routing (#/ueben), funktioniert ohne Server-Konfiguration */
function currentRoute(): string {
    return window.location.hash.replace(/^#/, "") || "/";
}

function renderPage(route: string) {
    switch (route) {
        case "/":
            return <Welcome />;
        case "/ueben":
            return <Practice />;
        case "/pruefung":
            return <Exam />;
        case "/fortschritt":
            return <ProgressOverview />;
        case "/terminal":
            return <TerminalFreeMode />;
        default:
            return <NotFound />;
    }
}

export default function App() {
    const [route, setRoute] = useState(currentRoute);

    useEffect(() => {
        const handleChange = () => {
            setRoute(currentRoute());
            window.scrollTo(0, 0);
        };
        window.addEventListener("hashchange", handleChange);
        return () => window.removeEventListener("hashchange", handleChange);
    }, []);

    return (
        <>
            <Navbar route={route} />
            <main key={route}>{renderPage(route)}</main>
            <Footer />
        </>
    );
}
