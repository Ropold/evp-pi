# Plan: Linux-Übungskonsole zur Kannliste

## Ziel
Eine Konsole im Frontend, die sich wie ein echtes Linux-Terminal anfühlt. Sie stellt Aufgaben aus der Kannliste und prüft die Eingaben.

## Echte oder simulierte Konsole?
Ich würde die Konsole **simulieren**, nicht an ein echtes Linux anbinden.
- Ein echtes System (Docker-Container pro Nutzer über WebSocket) wäre aufwendig und ein Sicherheitsrisiko.
- Eine Simulation im Browser reicht, weil die Kannliste nur einen überschaubaren Befehlssatz braucht.
- Sie fühlt sich trotzdem echt an: Unbekannte Befehle antworten wie Bash (`foo: command not found`) und werfen keinen App-Fehler.

## Umsetzung (Frontend, React + TypeScript)
1. **Terminal-Oberfläche:** mit `xterm.js`, inklusive Prompt `benutzer@rechner:pfad$`, Befehlshistorie (Pfeiltasten) und `clear`.
2. **Virtuelles Dateisystem:** Baum aus Dateien und Ordnern mit Besitzer, Gruppe, Rechten (inkl. SGID), dazu Benutzer, Gruppen und `umask`.
3. **Befehle als eigene Module:** `pwd`, `cd`, `ls -l/-la`, `mkdir`, `touch`, `cp`, `mv`, `rm`, `chmod` (oktal und symbolisch), `chown`, `chgrp`, `id`, `whoami`, `sudo`, `su`, `adduser`/`usermod -aG`, `ping`, `ssh` (simuliert), `man`/`--help`, `echo`, `cat`.
   - Die Befehle prüfen die Rechte genauso wie Linux, z. B. „x auf jedem Elternordner“ oder `Permission denied`.
   - Unbekannte Befehle liefern `command not found`.
4. **Aufgaben-Modus:** Eine Aufgabe wird angezeigt, du arbeitest frei im Terminal.
   - Geprüft wird der **Zustand** des Dateisystems, nicht der exakte Befehlstext. So zählen `chmod 750` und `chmod u=rwx,g=rx,o=` beide als richtig.
   - Für Verständnisfragen („Kann Anna den Ordner auflisten?“) gibt es zusätzlich eine Antwort-Eingabe.

## Aufgaben-Ablauf
- **Aufbau:** Oben steht immer die Aufgabe (Kategorie, Nummer, Fortschritt, Aufgabentext) mit den Buttons [Tipp] [Lösung zeigen] [Überspringen]. Darunter liegt das Terminal.
- **Lösen:** Du tippst frei, Umwege sind erlaubt. Nach jedem Befehl wird der Zustand geprüft. Ist das Ziel erreicht, kommen ein Häkchen, eine kurze Erklärung und die nächste Aufgabe.
- **Tipp:** in Stufen, zuerst der Befehlsname (`chmod`), dann die Syntax (`chmod g+? datei`).
- **Lösung zeigen:** eine oder mehrere richtige Lösungen mit einer Erklärung in einem Satz. Danach musst du den Befehl selbst eintippen, um weiterzukommen.
- **Selbst bewerten:** Nach jeder Aufgabe bewertest du selbst, wie schwer sie für dich war: [Schwer] [Mittel] [Leicht].
  - Diese Bewertung ist **deine persönliche** und wird im Browser gespeichert, nicht in der JSON.
  - Du kannst sie jederzeit ändern, wenn die Aufgabe wieder kommt.
  - Neue, noch nicht bewertete Aufgaben gelten als „Neu“.
- **Wiederholung:** richtet sich nach deiner Bewertung (Karteikasten-Prinzip).
  - Schwer: kommt bald wieder.
  - Mittel: kommt später wieder.
  - Leicht: kommt selten.
  - Tipp oder Lösung gebraucht: zählt automatisch als „Schwer“.
- **Üben nach Bewertung:** Buttons [Neu] [Schwer] [Mittel] [Leicht] [Alle] filtern nach deiner eigenen Einstufung, z. B. „nur meine schweren Aufgaben“.
  - Optional können Kategorien der Kannliste (Benutzer und Gruppen, SGID …) zusätzlich gefiltert werden.
- **Modi:** Im Lernmodus gibt es Tipps und Lösung. Im Prüfungsmodus gibt es keine Hilfe, dafür eine Auswertung am Ende.
- **Verständnisfragen** („Kann Ben den Ordner auflisten?“) beantwortest du in einem Antwortfeld statt im Terminal.

## Speicherung der Kannliste und Aufgaben
- Alles läuft **nur im Frontend**, ohne Datenbank und ohne API.
- Die Aufgaben liegen als `aufgaben.json` im Frontend (`frontend/src/data/`) und werden direkt importiert.
- Jede Aufgabe enthält Kategorie, Ausgangszustand, Aufgabentext, Tipps, Lösungen und Prüfregel. Eine Schwierigkeit steht **nicht** in der JSON.
- Die JSON-Datei ist **nur Inhalt** und wird zur Laufzeit nie verändert.
- Deine Bewertungen und den Lernfortschritt speichert der Browser getrennt in `localStorage`, z. B. `{ "chmod-01": { "bewertung": "schwer", "faellig": "2026-11-06" } }`.

## Rolle des Backends
- Das Java-Backend bleibt, wie es ist. Es liefert nur das gebaute Frontend aus (Docker-Pipeline).
- Es bekommt erst Aufgaben, wenn Benutzerkonten, zentral gespeicherter Fortschritt oder eine Datenbank dazukommen. Das JSON-Format lässt sich dann direkt übernehmen.

## Reihenfolge
ordnerstruktur.md befolgen. also andere namen, aber von stil her!! 
1. Virtuelles Dateisystem und Grundbefehle (`pwd`, `cd`, `ls`, `mkdir`)
2. Rechte-Befehle (`chmod`, `chown`, `chgrp`, `id`, SGID, `umask`)
3. Aufgaben-JSON und Prüflogik
4. Feinschliff: `man`/`--help`, Tab-Vervollständigung, Fortschrittsanzeige
