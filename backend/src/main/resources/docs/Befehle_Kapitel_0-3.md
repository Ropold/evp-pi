# Befehlsübersicht – Raspberry Pi (Testfälle 0.0 – 3.6)

Alle Befehle, die bis jetzt benutzt wurden – sortiert nach Thema.
`<user>`, `<gruppe>`, `<datei>` usw. sind Platzhalter.

---

## Netzwerk einrichten (0.0)

| Befehl | Was er macht |
|---|---|
| `nmcli connection show` | Listet alle Netzwerkverbindungen des NetworkManagers auf (Name, UUID, Typ, Gerät) |
| `sudo nmcli connection modify "<verbindung>" ipv4.method manual ipv4.addresses 172.30.4.1/16 ipv4.gateway 172.30.0.1 ipv4.dns "172.30.0.1"` | Stellt eine Verbindung von DHCP auf eine **feste IP** um: Adresse mit Netzmaske (`/16`), Gateway und DNS-Server |
| `sudo nmtui` | Öffnet die Text-Oberfläche des NetworkManagers – Verbindungen per Menü bearbeiten (z. B. feste IP eintragen) |
| `sudo systemctl restart NetworkManager` | Startet den Netzwerkdienst neu, damit geänderte Einstellungen aktiv werden |

## System aktualisieren & Software installieren (1.1 – 1.2)

| Befehl | Was er macht |
|---|---|
| `cat /etc/os-release` | Zeigt Name und Version des Betriebssystems (hier Debian 13 „trixie“) |
| `sudo apt update` | Lädt die aktuellen Paketlisten aus den Paketquellen – installiert noch nichts |
| `apt list --upgradable` | Zeigt, für welche installierten Pakete es eine neuere Version gibt (nach dem Upgrade: leer) |
| `sudo apt full-upgrade` | Installiert alle verfügbaren Updates; darf dafür auch Pakete neu installieren oder entfernen |
| `sudo reboot` | Startet den Pi neu (die ssh-Verbindung bricht dabei ab) |
| `sudo rpi-eeprom-update` | Prüft, ob es ein Update für den Bootloader (EEPROM) des Pi gibt bzw. ob es schon aktiv ist |
| `apt policy <paket>` | Zeigt, ob ein Paket in den Paketquellen verfügbar ist und welche Version installiert wäre (z. B. `neofetch`) |
| `sudo apt install <paket>` | Installiert ein Paket aus den Paketquellen (z. B. `fastfetch`) |
| `fastfetch` | Zeigt Systeminformationen (OS, Kernel, CPU, RAM …) mit dem Logo der Distribution – Nachfolger von `neofetch` |
| `q` | Beendet die seitenweise Anzeige (z. B. Changelog/AGB beim Upgrade) |

## Netzwerk prüfen – IP & MAC (1.3 – 1.5)

| Befehl | Was er macht |
|---|---|
| `ip a` | Kurz für `ip address` – zeigt alle Netzwerkschnittstellen mit ihren IP-Adressen |
| `ip a \| grep inet` | Filtert die Ausgabe: nur Zeilen mit `inet` (IPv4) und `inet6` (IPv6) |
| `ip a \| grep "inet "` | Mit Leerzeichen → nur die IPv4-Zeilen |
| `grep --version` | Zeigt die installierte Version von grep |
| `ip link \| grep -A 1 wlan` | Zeigt die WLAN-Schnittstelle **und** (`-A 1` = „after“) die folgende Zeile mit der MAC-Adresse (`link/ether`) |
| `hostname -I` | Gibt nur die IP-Adresse(n) des eigenen Rechners aus |
| `ping -c 4 <ip>` | Schickt genau 4 Pakete an einen anderen Rechner und prüft, ob er antwortet (ohne `-c` mit `Strg + C` abbrechen) |
| `ip neigh \| grep <ip>` | Zeigt aus der Nachbartabelle (ARP) die MAC-Adresse (`lladdr`) zu einer IP, z. B. vom Partner-Pi |

## SSH-Schlüssel einrichten (1.7)

| Befehl | Was er macht |
|---|---|
| `mkdir -p ~/.ssh` | Legt (auf dem Pi) den Ordner `.ssh` im eigenen Home an, falls er noch fehlt |
| `chmod 700 ~/.ssh` | Nur der Besitzer darf den Ordner lesen, beschreiben und öffnen (`rwx------`) – sonst verweigert ssh den Schlüssel |
| `touch ~/.ssh/authorized_keys` | Legt die (leere) Datei für die erlaubten Public-Keys an |
| `chmod 600 ~/.ssh/authorized_keys` | Nur der Besitzer darf die Datei lesen und schreiben (`rw-------`) |
| `ls -la ~/.ssh` | Prüft Ordner, Datei und Rechte |
| `ssh-keygen -t ed25519 -C "Robert Stolz"` | **Auf dem Windows-Rechner:** erzeugt ein Schlüsselpaar (Typ ed25519) mit Kommentar; Ablage in `C:\Users\<name>\.ssh` |
| `Get-Content $env:USERPROFILE\.ssh\id_ed25519.pub` | **PowerShell:** zeigt den Public-Key an, um ihn zu kopieren |
| `nano ~/.ssh/authorized_keys` | Public-Key auf dem Pi in die Datei einfügen (Rechtsklick), speichern, beenden |
| `ssh -o PreferredAuthentications=publickey rstolz@172.30.4.1` | Anmeldung, die **nur** den Schlüssel erlaubt – klappt sie, funktioniert die Key-Anmeldung ohne Passwort |
| `ssh -v rstolz@172.30.4.1` | Anmeldung mit ausführlicher Ausgabe („verbose“) – zeigt z. B. `Offering public key` |

## Verbindung & Sitzung

| Befehl | Was er macht |
|---|---|
| `ssh rstolz@Stolz.fritz.box` | Baut eine verschlüsselte Verbindung zum Pi auf (zuhause, per Hostname) und meldet als `rstolz` an |
| `ssh rstolz@172.30.4.1` | Dasselbe in der Schule (feste IP im WLAN `cps-002`) |
| `ssh <user>@Stolz.fritz.box` | Anmeldung als ein anderer Benutzer (z. B. `dherzog`, `qwertz`) |
| `exit` | Beendet die aktuelle Sitzung/Shell (bei `su` zurück zum vorherigen Benutzer, bei ssh Verbindung trennen) |
| `whoami` | Zeigt, als welcher Benutzer man gerade angemeldet ist |
| `pwd` | Zeigt das aktuelle Verzeichnis („print working directory“) |
| `cd <ordner>` | Wechselt in ein anderes Verzeichnis |
| `Strg + C` | Bricht den laufenden Befehl ab (z. B. wenn `cat` ohne Datei wartet) |

## Root-Rechte & Benutzerwechsel

| Befehl | Was er macht |
|---|---|
| `sudo <befehl>` | Führt einen Befehl mit Admin-Rechten (als root) aus – fragt nach dem **eigenen** Passwort |
| `sudo -i` | Öffnet eine dauerhafte root-Shell (Prompt endet auf `#`) |
| `sudo -l` | Listet auf, welche Befehle der aktuelle Benutzer per sudo ausführen darf |
| `sudo whoami` | Test, ob sudo funktioniert → Ausgabe `root` |
| `su - <user>` | Wechselt zu einem anderen Benutzer mit vollständigem Login (eigenes Home, `.profile` wird geladen) – fragt nach dem Passwort **des Zielbenutzers** |
| `su <user>` | Wechselt den Benutzer, bleibt aber im aktuellen Verzeichnis und in der alten Umgebung |

## Dateien anzeigen & durchsuchen

| Befehl | Was er macht |
|---|---|
| `cat <datei>` | Gibt den kompletten Inhalt einer Datei aus |
| `less <datei>` | Zeigt eine Datei seitenweise an (blättern mit Pfeiltasten, beenden mit `q`) |
| `tail -n 7 <datei>` | Zeigt nur die letzten 7 Zeilen einer Datei |
| `grep <text> <datei>` | Zeigt nur die Zeilen, die den Text enthalten |
| `grep -n <text> <datei>` | Wie oben, zusätzlich mit Zeilennummer |
| `grep -n "^sudo:" /etc/group` | `^` = Zeilenanfang → findet nur Zeilen, die mit `sudo:` **beginnen** |
| `grep -nE "^(museum\|event\|ohmega):" /etc/group` | `-E` erlaubt `\|` (= „oder“) → sucht mehrere Begriffe auf einmal |
| `grep <text> datei1 datei2 datei3` | Durchsucht mehrere Dateien, schreibt den Dateinamen vor jeden Treffer |
| `<befehl> \| cut -d'$' -f1,4` | Schneidet jede Zeile am Zeichen `$` auf und zeigt nur Teil 1 und 4 (hier: Name + Salt) |
| `man 5 group` | Öffnet die Hilfeseite (Handbuch) zum Dateiformat von `/etc/group` |
| `man hier` | Hilfeseite zur Verzeichnisstruktur von Linux (FHS) |

## Verzeichnisse & Dateien auflisten

| Befehl | Was er macht |
|---|---|
| `ls -l <ordner>` | Listet den Inhalt ausführlich auf (Rechte, Besitzer, Gruppe, Größe, Datum, Name) |
| `ls -la <ordner>` | Wie oben, zeigt zusätzlich versteckte Dateien (Name beginnt mit `.`) |
| `ls -ld <ordner>` | Zeigt den **Ordner selbst** an, nicht seinen Inhalt |
| `ls -l /etc/*.bak` | `*` = Platzhalter → zeigt alle Dateien in `/etc`, die auf `.bak` enden |

## Benutzer verwalten

| Befehl | Was er macht |
|---|---|
| `sudo adduser <user>` | Legt einen neuen Benutzer an (inkl. Home-Verzeichnis, eigener Gruppe, Passwort, Infos) |
| `sudo adduser <user> <gruppe>` | Fügt einen **bestehenden** Benutzer einer Gruppe hinzu |
| `sudo deluser <user> <gruppe>` | Entfernt einen Benutzer aus einer Gruppe (Benutzer bleibt bestehen) |
| `sudo deluser --remove-home <user>` | Löscht einen Benutzer samt Home-Verzeichnis |
| `id <user>` | Zeigt UID, GID und alle Gruppen eines Benutzers (mit Nummern) |
| `groups <user>` | Zeigt alle Gruppen eines Benutzers (nur Namen) |
| `groups` | Zeigt die Gruppen des aktuell angemeldeten Benutzers |

## Gruppen verwalten

| Befehl | Was er macht |
|---|---|
| `sudo addgroup <gruppe>` | Legt eine neue Gruppe an |
| `sudo chgrp <gruppe> <datei/ordner>` | Ändert den Gruppeneigentümer einer Datei oder eines Ordners |

## Passwörter & Konten

| Befehl | Was er macht |
|---|---|
| `sudo chage -d 0 <user>` | Setzt die letzte Passwortänderung auf 1970 → Benutzer **muss** beim nächsten Login sein Passwort ändern |
| `sudo chage -l <user>` | Zeigt Ablauf-Informationen zu Passwort und Konto |
| `sudo passwd -S <user>` | Zeigt den Passwort-Status (`P` = gesetzt, `L` = gesperrt, `NP` = kein Passwort) |
| `sudo passwd -l <user>` | **Sperrt** das Passwort (setzt `!` vor den Hash in `/etc/shadow`) |
| `sudo passwd -u <user>` | **Entsperrt** das Passwort wieder (entfernt das `!`) – altes Passwort gilt wieder |

## Systemdateien prüfen

| Befehl | Was er macht |
|---|---|
| `sudo pwck -r` | Prüft `/etc/passwd` und `/etc/shadow` auf Fehler (`-r` = nur lesen, nichts reparieren) |
| `sudo grpck -r` | Prüft `/etc/group` und `/etc/gshadow` auf Fehler (keine Ausgabe = alles ok) |

## Dateien anlegen, kopieren, löschen

| Befehl | Was er macht |
|---|---|
| `sudo cp <datei> <datei>.bak` | Kopiert eine Datei (hier: Sicherheitskopie vor dem Bearbeiten) |
| `sudo mkdir -p /opt/licht/Blitzlicht` | Legt einen Ordner an; `-p` erzeugt fehlende Zwischenordner gleich mit |
| `touch <datei>` | Setzt den Zeitstempel einer Datei auf „jetzt“ – existiert sie nicht, wird sie **leer angelegt** |
| `sudo rm <datei>` | Löscht eine Datei |

## Rechte vergeben (chmod)

| Befehl | Was er macht |
|---|---|
| `sudo chmod g+w <ordner>` | **Buchstabennotation:** gibt der Gruppe (`g`) zusätzlich (`+`) Schreibrecht (`w`) – Rest bleibt unverändert |
| `sudo chmod 755 <ordner>` | **Oktalnotation:** setzt alle Rechte neu auf `rwxr-xr-x` |
| `sudo chmod 775 <ordner>` | **Oktalnotation:** setzt alle Rechte neu auf `rwxrwxr-x` (Gruppe darf schreiben) |
| `sudo chmod g+s <ordner>` | Setzt das **SGID-Bit** → neue Dateien im Ordner erben die Gruppe des Ordners |
| `umask` | Zeigt die Standard-Rechtemaske für neu angelegte Dateien (hier `0002`) |

Oktal-Rechner: `r = 4`, `w = 2`, `x = 1` → pro Block addieren (z. B. `rwx = 7`, `r-x = 5`).

## Shell & History

| Befehl | Was er macht |
|---|---|
| `history \| tail -n 5` | Zeigt die letzten 5 Einträge der Befehls-History |
| `source ~/.bashrc` | Liest die `.bashrc` neu ein, ohne sich ab- und wieder anzumelden |
| Befehlsanfang + `Pfeil hoch` / `Bild hoch` | Sucht in der History nur Befehle mit diesem Anfang (nach Änderung in `/etc/inputrc`) |
| `Strg + U` | Löscht die aktuelle Eingabezeile |

## Editor nano

| Befehl / Taste | Was er macht |
|---|---|
| `sudo nano <datei>` | Öffnet eine Systemdatei im Texteditor nano (mit root-Rechten) |
| `nano <datei>` | Öffnet eine eigene Datei (ohne sudo) |
| `Strg + O`, dann `Enter` | Speichern |
| `Strg + X` | Beenden |
| `Strg + X`, dann `N` | Beenden **ohne** zu speichern |
| `Strg + K` | Aktuelle Zeile ausschneiden |
| `Strg + U` | Ausgeschnittene Zeile einfügen |
| `Strg + _` | Zu einer Zeilennummer springen |
| `Strg + W` | Suchen |
| `Alt + W` | Weitersuchen (nächster Treffer) |
| `Alt + U` | Rückgängig |
| `Pos1` / `Ende` | Zum Zeilenanfang / Zeilenende |
| Rechtsklick (Windows-Terminal) | Text aus der Zwischenablage einfügen |

⚠️ Nicht `Alt` + Ziffernblock benutzen – Windows erzeugt dann Sonderzeichen (z. B. `♠`).

---

## Wichtige Dateien (Bezug)

| Datei | Inhalt |
|---|---|
| `/etc/os-release` | Name und Version des Betriebssystems |
| `~/.ssh/authorized_keys` | Public-Keys, mit denen man sich ohne Passwort anmelden darf (Rechte `600`) |
| `C:\Users\<name>\.ssh\id_ed25519` / `.pub` | Privater Schlüssel (geheim, bleibt auf dem PC) / öffentlicher Schlüssel (kommt auf den Pi) |
| `/etc/passwd` | Benutzer: Name, UID, GID, Infos, Home, Shell (für alle lesbar) |
| `/etc/shadow` | Passwort-Hashes + Ablaufdaten (nur root) |
| `/etc/group` | Gruppen und ihre Mitglieder (für alle lesbar) |
| `/etc/gshadow` | Gruppen-Passwörter und Mitglieder (nur root) |
| `/etc/sudoers` | Wer was mit sudo darf (`%sudo ALL=(ALL:ALL) ALL`) – nur mit `visudo` bearbeiten |
| `/etc/adduser.conf` | Einstellungen für `adduser` (z. B. `FIRST_UID=2001`) |
| `/etc/skel/` | Vorlage – wird ins Home jedes neuen Benutzers kopiert (z. B. `Welcome.txt`) |
| `/etc/inputrc` | Tastenbelegung der Shell (History-Suche mit Pfeil/Bild hoch) |
| `~/.bashrc` | Persönliche bash-Einstellungen (z. B. `HISTCONTROL=ignoreboth`) |
| `/opt/licht/Blitzlicht` | Ordner für die Lichtsequenzen (root:event, `drwxrwsr-x`) |
