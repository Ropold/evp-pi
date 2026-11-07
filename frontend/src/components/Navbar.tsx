import "./styles/Navbar.css";

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
