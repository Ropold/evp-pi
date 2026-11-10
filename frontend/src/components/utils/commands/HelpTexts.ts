export type HelpTextModel = {
    /** Einzeiler für help und NAME in der man-Page */
    summary: string;
    /** Aufruf-Zeile(n) wie bei echtem --help */
    synopsis: string[];
    /** Beschreibung direkt nach dem Aufruf */
    description: string[];
    /** Optionen: [Schreibweise, Bedeutung] */
    options?: [string, string][];
    /** Zusätzliche Hinweise (Rechte, Besonderheiten) */
    notes?: string[];
    examples: string[];
};

export const HELP_TEXTS: Record<string, HelpTextModel> = {
    addgroup: {
        summary: "Gruppe anlegen oder Benutzer zu einer Gruppe hinzufügen",
        synopsis: ["addgroup [--gid ID] GRUPPE", "addgroup BENUTZER GRUPPE"],
        description: [
            "Mit einem Argument wird eine neue Gruppe angelegt.",
            "Mit zwei Argumenten wird ein vorhandener BENUTZER zu einer vorhandenen GRUPPE hinzugefügt (wie adduser BENUTZER GRUPPE).",
        ],
        options: [
            ["--gid ID", "When creating a group, this option sets the group ID number of the new group to GID."],
            ["", "(GID = numerische Gruppen-ID, z. B. 2011 – kein Gruppenname)"],
        ],
        examples: ["sudo addgroup --gid 3000 labor", "sudo addgroup clara labor"],
    },
    adduser: {
        summary: "Benutzer anlegen oder zu einer Gruppe hinzufügen",
        synopsis: ["adduser [--gid ID] BENUTZER", "adduser BENUTZER GRUPPE"],
        description: [
            "Mit einem Argument wird ein neuer Benutzer angelegt: Benutzerkonto, gleichnamige Primärgruppe und Home-Verzeichnis /home/BENUTZER.",
            "Mit zwei Argumenten wird ein vorhandener BENUTZER zur vorhandenen GRUPPE hinzugefügt (weitere Gruppe).",
        ],
        options: [
            ["--gid ID", "When creating a user, this option sets the primary group ID number of the new user to GID."],
            ["", "(GID = numerische Gruppen-ID, kein Gruppenname)"],
        ],
        examples: ["sudo adduser clara", "sudo adduser clara labor", "sudo adduser --gid 3000 clara"],
    },
    cat: {
        summary: "Dateien verketten und ausgeben",
        synopsis: ["cat [DATEI]..."],
        description: ["Gibt den Inhalt der DATEIen auf der Standardausgabe aus."],
        examples: ["cat /etc/group", "cat bericht.txt"],
    },
    cd: {
        summary: "Arbeitsverzeichnis wechseln (Shell-Befehl)",
        synopsis: ["cd [VERZEICHNIS]"],
        description: [
            "Wechselt das aktuelle Arbeitsverzeichnis zu VERZEICHNIS.",
            "Ohne VERZEICHNIS (oder mit ~) wird ins Home-Verzeichnis gewechselt. cd - wechselt ins vorherige Verzeichnis.",
            "Pfade mit / am Anfang sind absolut (ab /), alle anderen relativ zum aktuellen Verzeichnis.",
            ". = aktuelles Verzeichnis, .. = übergeordnetes Verzeichnis, ~ = Home-Verzeichnis.",
        ],
        examples: ["cd /var/log", "cd ..", "cd ../archiv", "cd ~"],
    },
    chgrp: {
        summary: "Gruppenzugehörigkeit ändern",
        synopsis: ["chgrp [OPTION]... GRUPPE DATEI..."],
        description: ["Ändert die Gruppe jeder DATEI auf GRUPPE."],
        options: [["-R, --recursive", "Dateien und Verzeichnisse rekursiv bearbeiten"]],
        examples: ["chgrp labor liste.txt", "chgrp -R labor /daten/labor"],
    },
    chmod: {
        summary: "Zugriffsrechte von Dateien ändern",
        synopsis: ["chmod [OPTION]... MODUS[,MODUS]... DATEI...", "chmod [OPTION]... OKTAL-MODUS DATEI..."],
        description: [
            "Ändert die Zugriffsrechte jeder DATEI auf MODUS.",
            "",
            "Oktal: je eine Ziffer für Besitzer (u), Gruppe (g), others (o); r = 4, w = 2, x = 1.",
            "  Beispiel: 750 = rwx r-x ---",
            "  Eine vierte Ziffer davor setzt Spezialbits: 4 = SUID, 2 = SGID, 1 = Sticky-Bit (z. B. 2770, 1777).",
            "",
            "Symbolisch: [ugoa...][[-+=][rwxXst...]...][,...]",
            "  u = Besitzer, g = Gruppe, o = others, a = alle",
            "  + fügt Rechte hinzu, - entfernt sie, = setzt genau diese Rechte",
            "  s bei g = SGID, s bei u = SUID, t = Sticky-Bit",
            "  Ohne Rechte hinter = werden alle Rechte entfernt (z. B. go=).",
        ],
        options: [["-R, --recursive", "Dateien und Verzeichnisse rekursiv ändern"]],
        examples: ["chmod 750 archiv", "chmod g+w liste.txt", "chmod o-r liste.txt", "chmod u=rw,go= notizen.txt", "chmod g+s gemeinsam", "chmod +t ablage"],
    },
    chown: {
        summary: "Besitzer und Gruppe von Dateien ändern",
        synopsis: ["chown [OPTION]... [BESITZER][:[GRUPPE]] DATEI..."],
        description: [
            "Ändert Besitzer und/oder Gruppe jeder DATEI.",
            "  BESITZER         nur der Besitzer wird geändert",
            "  BESITZER:GRUPPE  Besitzer und Gruppe werden geändert",
            "  :GRUPPE          nur die Gruppe wird geändert (wie chgrp)",
            "  BESITZER:        Besitzer und dessen Primärgruppe",
        ],
        options: [["-R, --recursive", "Dateien und Verzeichnisse rekursiv bearbeiten"]],
        examples: ["sudo chown clara:labor liste.txt", "sudo chown clara liste.txt", "chown :labor liste.txt"],
    },
    clear: {
        summary: "Bildschirm leeren",
        synopsis: ["clear"],
        description: ["Leert das Terminal. Alternativ Strg+L."],
        examples: ["clear"],
    },
    cp: {
        summary: "Dateien und Verzeichnisse kopieren",
        synopsis: ["cp [OPTION]... QUELLE ZIEL", "cp [OPTION]... QUELLE... VERZEICHNIS"],
        description: ["Kopiert QUELLE nach ZIEL oder mehrere QUELLEn in VERZEICHNIS. Das Original bleibt erhalten."],
        options: [
            ["-a", "wie -r, Besitzer und Rechte bleiben möglichst erhalten"],
            ["-i, --interactive", "vor dem Überschreiben nachfragen"],
            ["-R, -r, --recursive", "Verzeichnisse rekursiv kopieren"],
            ["-v, --verbose", "erklären, was gemacht wird"],
        ],
        examples: ["cp liste.txt /tmp/", "cp -r dokumente sicherung"],
    },
    echo: {
        summary: "Eine Textzeile ausgeben",
        synopsis: ["echo [TEXT]..."],
        description: ["Gibt TEXT aus. Mit > datei wird in eine Datei geschrieben, mit >> angehängt."],
        examples: ["echo hallo > gruss.txt"],
    },
    exit: {
        summary: "Sitzung beenden (Shell-Befehl)",
        synopsis: ["exit"],
        description: [
            "Beendet eine ssh-, su- oder sudo -i-Sitzung und kehrt zur vorherigen zurück.",
            "In der ersten Sitzung: abmelden und neu anmelden – dabei werden die Gruppen neu gelesen.",
        ],
        examples: ["exit"],
    },
    groups: {
        summary: "Gruppenzugehörigkeit von Benutzern anzeigen",
        synopsis: ["groups [BENUTZER]..."],
        description: [
            "Zeigt die Gruppen jedes BENUTZERs (laut /etc/group).",
            "Ohne BENUTZER: die Gruppen der aktuellen Sitzung.",
        ],
        examples: ["groups", "groups ben"],
    },
    help: {
        summary: "Verfügbare Befehle anzeigen",
        synopsis: ["help"],
        description: ["Listet alle Befehle der Simulation mit kurzer Beschreibung."],
        examples: ["help"],
    },
    hostname: {
        summary: "Rechnernamen anzeigen",
        synopsis: ["hostname"],
        description: ["Gibt den Namen des Rechners aus."],
        examples: ["hostname"],
    },
    id: {
        summary: "Benutzer- und Gruppen-IDs anzeigen",
        synopsis: ["id [OPTION]... [BENUTZER]"],
        description: [
            "Zeigt Benutzer- und Gruppeninformationen für BENUTZER bzw. ohne BENUTZER für die aktuelle Sitzung.",
            "  uid = Benutzer-ID, gid = Primärgruppe, Gruppen = alle Gruppen (Primärgruppe und weitere)",
        ],
        options: [
            ["-g, --group", "nur die ID der Primärgruppe ausgeben"],
            ["-G, --groups", "alle Gruppen-IDs ausgeben"],
            ["-n, --name", "Namen statt Nummern ausgeben (mit -u, -g oder -G)"],
            ["-u, --user", "nur die Benutzer-ID ausgeben"],
        ],
        examples: ["id", "id ben", "id -Gn tim"],
    },
    ls: {
        summary: "Verzeichnisinhalte auflisten",
        synopsis: ["ls [OPTION]... [DATEI]..."],
        description: ["Auflistung der DATEIen (standardmäßig das aktuelle Verzeichnis)."],
        options: [
            ["-a, --all", "Einträge, die mit . beginnen, nicht ignorieren"],
            ["-d, --directory", "Verzeichnisse selbst auflisten, nicht deren Inhalt"],
            ["-l", "ausführliches Listenformat verwenden"],
        ],
        notes: [
            "Mehrere Optionen darf man zusammenschreiben, z. B. -la oder -ld.",
            "Spalten bei -l: Typ+Rechte, Anzahl Links, Besitzer, Gruppe, Größe, Datum, Name.",
            "  Typ: d = Verzeichnis, - = Datei. Rechte: je 3 Zeichen für Besitzer, Gruppe, others.",
        ],
        examples: ["ls -l /var", "ls -a", "ls -ld /var"],
    },
    man: {
        summary: "Handbuchseiten anzeigen",
        synopsis: ["man BEFEHL"],
        description: ["Zeigt die ausführliche Handbuchseite (manual page) zu BEFEHL. Kurzhilfe: BEFEHL --help."],
        examples: ["man chown", "man ls"],
    },
    mkdir: {
        summary: "Verzeichnisse anlegen",
        synopsis: ["mkdir [OPTION]... VERZEICHNIS..."],
        description: ["Legt die VERZEICHNISse an, falls sie noch nicht existieren."],
        options: [["-p, --parents", "keinen Fehler, falls vorhanden; übergeordnete Verzeichnisse nach Bedarf anlegen"]],
        examples: ["mkdir entwuerfe", "mkdir archiv/2024", "mkdir -p a/b/c"],
    },
    mv: {
        summary: "Dateien verschieben oder umbenennen",
        synopsis: ["mv [OPTION]... QUELLE ZIEL", "mv [OPTION]... QUELLE... VERZEICHNIS"],
        description: ["Benennt QUELLE in ZIEL um oder verschiebt QUELLE(n) in VERZEICHNIS. Am alten Ort ist danach nichts mehr."],
        options: [
            ["-f, --force", "vor dem Überschreiben nicht nachfragen"],
            ["-i, --interactive", "vor dem Überschreiben nachfragen"],
            ["-v, --verbose", "erklären, was gemacht wird"],
        ],
        examples: ["mv liste.txt archiv/", "mv alt.txt neu.txt"],
    },
    ping: {
        summary: "Erreichbarkeit eines Rechners prüfen",
        synopsis: ["ping [-c ANZAHL] RECHNER"],
        description: [
            "Löst den Namen RECHNER in eine IP-Adresse auf und schickt Testpakete (ICMP Echo Request).",
            "Antworten zeigen, dass der Rechner erreichbar ist.",
        ],
        options: [["-c ANZAHL", "nach ANZAHL Paketen aufhören (Standard in der Simulation: 4)"]],
        examples: ["ping srv01", "ping -c 2 192.168.10.5"],
    },
    pwd: {
        summary: "Aktuelles Verzeichnis ausgeben",
        synopsis: ["pwd"],
        description: ["Gibt den absoluten Pfad des aktuellen Arbeitsverzeichnisses aus."],
        examples: ["pwd"],
    },
    rm: {
        summary: "Dateien und Verzeichnisse entfernen",
        synopsis: ["rm [OPTION]... DATEI..."],
        description: ["Entfernt jede angegebene DATEI. Verzeichnisse werden nur mit -r entfernt."],
        options: [
            ["-f, --force", "nicht vorhandene Dateien ignorieren, nie nachfragen"],
            ["-i", "vor jedem Entfernen nachfragen"],
            ["-r, -R, --recursive", "Verzeichnisse und ihren Inhalt rekursiv entfernen"],
            ["-v, --verbose", "erklären, was gemacht wird"],
        ],
        examples: ["rm liste.txt", "rm -r entwuerfe"],
    },
    rmdir: {
        summary: "Leere Verzeichnisse entfernen",
        synopsis: ["rmdir VERZEICHNIS..."],
        description: ["Entfernt die VERZEICHNISse, wenn sie leer sind."],
        examples: ["rmdir leer"],
    },
    ssh: {
        summary: "Per Secure Shell an einem Rechner anmelden",
        synopsis: ["ssh [BENUTZER@]RECHNER"],
        description: [
            "Meldet BENUTZER am RECHNER an. RECHNER ist ein Rechnername oder eine IP-Adresse.",
            "Ohne BENUTZER@ wird der aktuelle Benutzername verwendet. Mit exit kehrt man zurück.",
        ],
        notes: [
            "In der Simulation sind per ssh erreichbar: pi, srv01, web01, lightning (Name oder IP, siehe ping).",
        ],
        examples: ["ssh anna@pi", "ssh anna@192.168.0.42"],
    },
    su: {
        summary: "Benutzer wechseln",
        synopsis: ["su [-] [BENUTZER]"],
        description: ["Startet eine Shell als BENUTZER (Standard: root). Braucht das Passwort von BENUTZER."],
        options: [["-, -l, --login", "Login-Shell: ins Home von BENUTZER wechseln, wie bei einer neuen Anmeldung"]],
        notes: [
            "In der Simulation gibt es keine Passwörter: nutze sudo su - BENUTZER (als Mitglied von sudo).",
        ],
        examples: ["sudo su - clara", "exit"],
    },
    sudo: {
        summary: "Befehl als root (oder anderer Benutzer) ausführen",
        synopsis: ["sudo [-u BENUTZER] BEFEHL", "sudo -i", "sudo -s"],
        description: [
            "Führt BEFEHL mit root-Rechten aus. Erlaubt ist das nur Mitgliedern der Gruppe sudo.",
        ],
        options: [
            ["-i", "Login-Shell als root öffnen"],
            ["-s", "Shell als root öffnen (im aktuellen Verzeichnis bleiben)"],
            ["-u BENUTZER", "BEFEHL als BENUTZER statt als root ausführen"],
        ],
        examples: ["sudo chown clara liste.txt", "sudo -u clara ls /daten"],
    },
    touch: {
        summary: "Leere Datei anlegen oder Zeitstempel ändern",
        synopsis: ["touch DATEI..."],
        description: ["Legt jede DATEI leer an, falls sie nicht existiert; sonst wird nur der Zeitstempel aktualisiert."],
        examples: ["touch liste.txt"],
    },
    umask: {
        summary: "Maske für die Rechte neuer Dateien anzeigen oder setzen (Shell-Befehl)",
        synopsis: ["umask [-S] [MASKE]"],
        description: [
            "Zeigt oder setzt die Maske, die festlegt, welche Rechte bei neu angelegten Dateien und Verzeichnissen weggenommen werden.",
        ],
        options: [["-S", "Maske symbolisch ausgeben (welche Rechte erlaubt bleiben)"]],
        examples: ["umask", "umask -S", "umask 0022"],
    },
    usermod: {
        summary: "Benutzerkonto ändern",
        synopsis: ["usermod [OPTIONEN] BENUTZER"],
        description: ["Ändert die Einstellungen eines vorhandenen Benutzerkontos."],
        options: [
            ["-a, --append", "BENUTZER zu den mit -G genannten weiteren Gruppen hinzufügen (nur zusammen mit -G)"],
            ["-G, --groups GRUPPEN", "Liste der weiteren Gruppen, durch Komma getrennt"],
            ["", "Ohne -a ersetzt -G alle bisherigen weiteren Gruppen!"],
        ],
        examples: ["sudo usermod -aG labor clara"],
    },
    whoami: {
        summary: "Eigenen Benutzernamen anzeigen",
        synopsis: ["whoami"],
        description: ["Gibt den Namen des aktuellen Benutzers aus."],
        examples: ["whoami"],
    },
};

function optionLines(options: [string, string][]): string[] {
    const width = Math.max(...options.map(([flag]) => flag.length)) + 2;
    return options.map(([flag, text]) => `  ${flag.padEnd(width)}${text}`);
}

/** Kurzhilfe im Stil von BEFEHL --help */
export function helpLines(name: string): string[] {
    const help = HELP_TEXTS[name];
    if (!help) return [];
    const lines = help.synopsis.map((synopsis, index) => `${index === 0 ? "Aufruf: " : "   oder: "}${synopsis}`);
    lines.push(...help.description);
    lines.push("", ...optionLines([...(help.options ?? []), ["    --help", "diese Hilfe anzeigen und beenden"]]));
    if (help.notes) lines.push("", ...help.notes);
    lines.push("", "Beispiele:", ...help.examples.map((example) => `  ${example}`));
    return lines;
}

/** Ausführliche Handbuchseite im Stil von man BEFEHL */
export function manLines(name: string): string[] {
    const help = HELP_TEXTS[name];
    if (!help) return [];
    const title = `${name.toUpperCase()}(1)`;
    const indent = (text: string) => (text ? "       " + text : "");
    const bold = (text: string) => `\x1b[1m${text}\x1b[0m`;
    const lines = [
        `${title.padEnd(30)}Handbuch (Simulation)${title.padStart(30)}`,
        "",
        bold("BEZEICHNUNG"),
        indent(`${name} - ${help.summary}`),
        "",
        bold("ÜBERSICHT"),
        ...help.synopsis.map(indent),
        "",
        bold("BESCHREIBUNG"),
        ...help.description.map(indent),
    ];
    if (help.options) {
        lines.push("", bold("OPTIONEN"));
        for (const [flag, text] of help.options) {
            if (flag) lines.push(indent(bold(flag)));
            lines.push(indent("       " + text));
        }
    }
    if (help.notes) lines.push("", bold("HINWEISE"), ...help.notes.map(indent));
    lines.push("", bold("BEISPIELE"), ...help.examples.map(indent));
    return lines;
}
