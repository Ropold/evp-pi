export type HelpTextModel = {
    summary: string;
    synopsis: string;
    description: string[];
    examples: string[];
};

export const HELP_TEXTS: Record<string, HelpTextModel> = {
    addgroup: {
        summary: "Gruppe anlegen oder Benutzer zu einer Gruppe hinzufügen",
        synopsis: "addgroup [--gid GID] GRUPPE  |  addgroup BENUTZER GRUPPE",
        description: [
            "Mit einem Argument wird eine neue Gruppe angelegt.",
            "--gid GID: When creating a group, this option sets the group ID number of the new group to GID.",
            "Mit zwei Argumenten wird BENUTZER zur GRUPPE hinzugefügt (wie adduser).",
            "Braucht root-Rechte, also meist mit sudo.",
        ],
        examples: ["sudo addgroup --gid 2011 tools", "sudo addgroup ben team"],
    },
    adduser: {
        summary: "Benutzer anlegen oder zu einer Gruppe hinzufügen",
        synopsis: "adduser [--gid GID] BENUTZER [GRUPPE]",
        description: [
            "Mit einem Argument wird ein neuer Benutzer samt Primärgruppe und Home angelegt.",
            "--gid GID: When creating a user, this option sets the primary group ID number of the new user to GID.",
            "Mit zwei Argumenten wird BENUTZER zur GRUPPE hinzugefügt.",
            "Braucht root-Rechte, also meist mit sudo.",
            "Die neue Gruppe wirkt erst nach erneutem Einloggen.",
        ],
        examples: ["sudo adduser clara team", "sudo adduser --gid 2001 mkeller"],
    },
    cat: {
        summary: "Dateiinhalt ausgeben",
        synopsis: "cat DATEI...",
        description: ["Gibt den Inhalt der Dateien aus. Braucht r auf der Datei."],
        examples: ["cat /etc/group"],
    },
    cd: {
        summary: "Arbeitsverzeichnis wechseln",
        synopsis: "cd [VERZEICHNIS]",
        description: [
            "Ohne Argument geht es ins Home (~). cd - wechselt ins vorherige Verzeichnis.",
            ". ist das aktuelle, .. das übergeordnete Verzeichnis.",
            "Braucht x auf dem Ziel und auf jedem Verzeichnis im Pfad.",
        ],
        examples: ["cd /projekt", "cd ..", "cd ~"],
    },
    chgrp: {
        summary: "Gruppe einer Datei ändern",
        synopsis: "chgrp [-R] GRUPPE DATEI...",
        description: [
            "Der Besitzer darf die Gruppe auf eine Gruppe ändern, in der er selbst Mitglied ist.",
            "Sonst braucht man root (sudo).",
        ],
        examples: ["chgrp team bericht.txt"],
    },
    chmod: {
        summary: "Zugriffsrechte ändern",
        synopsis: "chmod [-R] MODUS DATEI...",
        description: [
            "MODUS oktal: 4 = r, 2 = w, 1 = x, je Ziffer für Besitzer, Gruppe, others (z. B. 750).",
            "Vierte Ziffer davor für Spezialbits: 4 = SUID, 2 = SGID, 1 = Sticky (z. B. 2775).",
            "MODUS symbolisch: [ugoa][+-=][rwxXst], mehrere mit Komma (z. B. u=rwx,g=rx,o=).",
            "Nur der Besitzer oder root darf die Rechte ändern.",
        ],
        examples: ["chmod 700 privat", "chmod g+s gemeinsam", "chmod o-rwx datei.txt"],
    },
    chown: {
        summary: "Besitzer und Gruppe ändern",
        synopsis: "chown [-R] BESITZER[:GRUPPE] DATEI...",
        description: [
            "BESITZER:GRUPPE ändert beides, :GRUPPE nur die Gruppe, BESITZER: setzt dessen Primärgruppe.",
            "Den Besitzer ändern darf nur root (sudo).",
        ],
        examples: ["sudo chown ben:team abgabe.txt", "chown :team notizen.txt"],
    },
    clear: {
        summary: "Bildschirm leeren",
        synopsis: "clear",
        description: ["Leert das Terminal. Alternativ Strg+L."],
        examples: ["clear"],
    },
    cp: {
        summary: "Dateien und Verzeichnisse kopieren",
        synopsis: "cp [-r] QUELLE... ZIEL",
        description: [
            "Verzeichnisse nur mit -r. Die Kopie gehört dir, die Rechte kommen von der Quelle minus umask.",
            "Braucht r auf der Quelle sowie w und x auf dem Zielverzeichnis.",
        ],
        examples: ["cp /projekt/plan.txt ~", "cp -r dokumente sicherung"],
    },
    echo: {
        summary: "Text ausgeben",
        synopsis: "echo [TEXT...]",
        description: ["Gibt den Text aus. Mit > datei wird in eine Datei geschrieben, mit >> angehängt."],
        examples: ["echo hallo > gruss.txt"],
    },
    exit: {
        summary: "Sitzung beenden",
        synopsis: "exit",
        description: [
            "Beendet eine ssh- oder su-Sitzung und kehrt zur vorherigen zurück.",
            "In der ersten Sitzung: Abmelden und neu anmelden (Gruppen werden neu gelesen).",
        ],
        examples: ["exit"],
    },
    groups: {
        summary: "Gruppen anzeigen",
        synopsis: "groups [BENUTZER]",
        description: ["Ohne Argument: Gruppen der aktuellen Sitzung. Mit Benutzer: Gruppen laut /etc/group."],
        examples: ["groups", "groups ben"],
    },
    help: {
        summary: "Verfügbare Befehle anzeigen",
        synopsis: "help",
        description: ["Listet alle Befehle der Simulation mit kurzer Beschreibung."],
        examples: ["help"],
    },
    hostname: {
        summary: "Rechnernamen anzeigen",
        synopsis: "hostname",
        description: ["Gibt den Namen des Rechners aus."],
        examples: ["hostname"],
    },
    id: {
        summary: "UID, GID und Gruppen anzeigen",
        synopsis: "id [-u|-g|-G] [-n] [BENUTZER]",
        description: [
            "Zeigt uid, gid (Primärgruppe) und groups (alle Gruppen).",
            "Ohne Benutzer: Werte der aktuellen Sitzung. Neue Gruppen erscheinen erst nach erneutem Einloggen.",
        ],
        examples: ["id", "id ben"],
    },
    ls: {
        summary: "Verzeichnisinhalt auflisten",
        synopsis: "ls [-l] [-a] [-d] [DATEI...]",
        description: [
            "-l  ausführlich: Typ+Rechte, Links, Besitzer, Gruppe, Größe, Datum, Name",
            "-a  auch versteckte Einträge (., .. und Namen mit Punkt)",
            "-d  Verzeichnis selbst statt Inhalt anzeigen",
            "Auflisten braucht r auf dem Verzeichnis, für -l zusätzlich x.",
        ],
        examples: ["ls -l /projekt", "ls -la", "ls -ld /projekt"],
    },
    man: {
        summary: "Handbuchseite anzeigen",
        synopsis: "man BEFEHL",
        description: ["Zeigt die Handbuchseite. Kurzhilfe gibt es auch mit BEFEHL --help."],
        examples: ["man chmod"],
    },
    mkdir: {
        summary: "Verzeichnisse anlegen",
        synopsis: "mkdir [-p] VERZEICHNIS...",
        description: [
            "-p legt auch fehlende Elternverzeichnisse an.",
            "Rechte: 777 minus umask. Mit SGID am Elternordner werden Gruppe und SGID geerbt.",
            "Braucht w und x auf dem Elternverzeichnis.",
        ],
        examples: ["mkdir projekte", "mkdir -p a/b/c", "mkdir ../neu"],
    },
    mv: {
        summary: "Verschieben oder umbenennen",
        synopsis: "mv QUELLE... ZIEL",
        description: [
            "Besitzer, Gruppe und Rechte bleiben erhalten.",
            "Braucht w und x auf dem Quell- und dem Zielverzeichnis.",
        ],
        examples: ["mv notizen.txt dokumente/", "mv alt.txt neu.txt"],
    },
    ping: {
        summary: "Erreichbarkeit eines Rechners prüfen",
        synopsis: "ping [-c ANZAHL] RECHNER",
        description: [
            "Löst den Namen auf und schickt Pakete. In der Simulation werden 4 Pakete gesendet.",
            "\"Name or service not known\": Name konnte nicht aufgelöst werden.",
            "\"Destination Host Unreachable\": Name bekannt, Rechner antwortet nicht.",
        ],
        examples: ["ping server", "ping 192.168.0.10"],
    },
    pwd: {
        summary: "Aktuelles Verzeichnis ausgeben",
        synopsis: "pwd",
        description: ["Gibt den absoluten Pfad des Arbeitsverzeichnisses aus."],
        examples: ["pwd"],
    },
    rm: {
        summary: "Dateien und Verzeichnisse löschen",
        synopsis: "rm [-r] [-f] DATEI...",
        description: [
            "Verzeichnisse nur mit -r. -f unterdrückt Fehler bei fehlenden Dateien.",
            "Löschen braucht w und x auf dem Verzeichnis, in dem der Eintrag liegt, nicht auf der Datei.",
        ],
        examples: ["rm alt.txt", "rm -r entwuerfe"],
    },
    rmdir: {
        summary: "Leere Verzeichnisse löschen",
        synopsis: "rmdir VERZEICHNIS...",
        description: ["Löscht nur leere Verzeichnisse."],
        examples: ["rmdir leer"],
    },
    ssh: {
        summary: "Auf einem Rechner anmelden",
        synopsis: "ssh [BENUTZER@]RECHNER",
        description: [
            "Meldet dich als BENUTZER an. RECHNER ist ein Name oder eine IP.",
            "In der Simulation ist nur pi (192.168.0.42, localhost) per ssh erreichbar. Mit exit zurück.",
        ],
        examples: ["ssh ben@pi", "ssh anna@192.168.0.42"],
    },
    su: {
        summary: "Benutzer wechseln",
        synopsis: "su [-] [BENUTZER]",
        description: [
            "Wechselt zu BENUTZER (Standard: root). Braucht dessen Passwort.",
            "In der Simulation gibt es keine Passwörter: nutze sudo su - BENUTZER oder ssh BENUTZER@pi.",
        ],
        examples: ["sudo su - clara"],
    },
    sudo: {
        summary: "Befehl als root ausführen",
        synopsis: "sudo [-u BENUTZER] BEFEHL | sudo -i",
        description: [
            "Führt BEFEHL mit root-Rechten aus. Nur für Mitglieder der Gruppe sudo.",
            "Nur verwenden, wenn wirklich nötig, z. B. für chown oder adduser.",
            "-i öffnet eine root-Shell, -u führt den Befehl als anderer Benutzer aus.",
        ],
        examples: ["sudo adduser clara team", "sudo -u clara ls /projekt"],
    },
    touch: {
        summary: "Leere Datei anlegen oder Zeitstempel ändern",
        synopsis: "touch DATEI...",
        description: ["Neue Dateien bekommen 666 minus umask, mit SGID am Ordner dessen Gruppe."],
        examples: ["touch neu.txt"],
    },
    umask: {
        summary: "Standard-Rechtemaske anzeigen oder setzen",
        synopsis: "umask [-S] [MASKE]",
        description: [
            "Neue Dateien: 666 minus umask, neue Verzeichnisse: 777 minus umask.",
            "Bei umask 0002: Dateien rw-rw-r--, Verzeichnisse rwxrwxr-x.",
        ],
        examples: ["umask", "umask -S", "umask 0022"],
    },
    usermod: {
        summary: "Benutzerkonto ändern",
        synopsis: "usermod -aG GRUPPE[,GRUPPE] BENUTZER",
        description: [
            "-aG fügt Gruppen hinzu. Ohne -a ersetzt -G alle weiteren Gruppen!",
            "Braucht root-Rechte (sudo). Wirkt erst nach erneutem Einloggen.",
        ],
        examples: ["sudo usermod -aG team clara"],
    },
    whoami: {
        summary: "Eigenen Benutzernamen anzeigen",
        synopsis: "whoami",
        description: ["Gibt den Namen des aktuellen Benutzers aus."],
        examples: ["whoami"],
    },
};

export function helpLines(name: string): string[] {
    const help = HELP_TEXTS[name];
    if (!help) return [];
    return [`Usage: ${help.synopsis}`, help.summary + ".", "", ...help.description];
}

export function manLines(name: string): string[] {
    const help = HELP_TEXTS[name];
    if (!help) return [];
    const title = `${name.toUpperCase()}(1)`;
    const indent = (text: string) => "       " + text;
    return [
        `${title.padEnd(30)}Handbuch (Simulation)${title.padStart(30)}`,
        "",
        "\x1b[1mNAME\x1b[0m",
        indent(`${name} - ${help.summary}`),
        "",
        "\x1b[1mSYNOPSIS\x1b[0m",
        indent(help.synopsis),
        "",
        "\x1b[1mBESCHREIBUNG\x1b[0m",
        ...help.description.map(indent),
        "",
        "\x1b[1mBEISPIELE\x1b[0m",
        ...help.examples.map(indent),
    ];
}
