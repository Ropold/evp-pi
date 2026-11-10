import "./styles/Navbar.css";
import { EXAM_SETS } from "./utils/ExamSets.ts";

type NavbarProps = {
    route: string;
};

const LINKS = [
    { route: "/", label: "Start" },
    { route: "/inhalt", label: "Inhalt" },
    { route: "/ueben", label: "Üben" },
    { route: "/pruefung", label: "Prüfung" },
    { route: "/fortschritt", label: "Fortschritt" },
    { route: "/terminal", label: "Freies Terminal" },
];

export default function Navbar({ route }: Readonly<NavbarProps>) {
    return (
        <nav className="navbar" aria-label="Hauptnavigation">
            <a className="navbar-brand" href="#/">
                <span aria-hidden="true">&gt;_</span> Linux-Kannliste
            </a>
            <div className="navbar-exams" role="group" aria-label="Probeklausuren">
                {EXAM_SETS.map((set) => (
                    <a
                        key={set.id}
                        href={`#/${set.id}`}
                        title={set.title}
                        aria-current={route === `/${set.id}` ? "page" : undefined}
                    >
                        {set.label}
                    </a>
                ))}
            </div>
            <ul className="navbar-links">
                {LINKS.map((link) => (
                    <li key={link.route}>
                        <a href={`#${link.route}`} aria-current={route === link.route ? "page" : undefined}>
                            {link.label}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
