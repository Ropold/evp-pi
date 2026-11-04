# Kannliste: Linux-Rechteverwaltung

Ich kann …

## Anmelden und Orientieren

- mich mit `ssh benutzer@rechner` (Name oder IP) auf einem Linux-Rechner einloggen
- mit `ping` prüfen, ob ein Rechner erreichbar ist und der Name aufgelöst wird
- den Prompt (`benutzer@rechner:pfad$`) lesen und erklären
- mit `man` und `--help` die Syntax eines Befehls nachschlagen
- eine Terminalausgabe genau lesen und Informationen daraus ableiten

## Benutzer und Gruppen

- mit `id` und `id benutzer` UID, GID und Gruppenmitgliedschaften auslesen
- den Unterschied zwischen Primärgruppe und weiteren Gruppen erklären
- einen Benutzer zu einer Gruppe hinzufügen (`adduser benutzer gruppe`, `usermod -aG gruppe benutzer`)
- erklären, warum eine Gruppenänderung erst nach erneutem Einloggen wirkt
- erklären, wann `sudo` nötig ist und warum man es nicht unnötig verwendet

## Rechte lesen

- eine Zeile von `ls -l` bzw. `ls -la` vollständig lesen (Typ, Rechte, Besitzer, Gruppe, Größe, Datum, Name)
- die Rechte `r`, `w` und `x` bei Dateien und bei Verzeichnissen unterscheiden
- erklären, was `r`, `w` und `x` bei einem Verzeichnis bedeuten (auflisten, anlegen und löschen, hineinwechseln)
- Rechte zwischen symbolischer Schreibweise (`rwxr-x---`) und oktaler Schreibweise (`750`) umrechnen
- bestimmen, welche Rechte (Besitzer, Gruppe, others) für eine bestimmte Person gelten
- einen Verzeichnisbaum mit Besitzer, Gruppe und Rechten lesen und fehlende Angaben ergänzen

## Rechte und Eigentümer ändern

- mit `chmod` Rechte oktal setzen (z. B. `chmod 700 ordner`)
- mit `chmod` Rechte symbolisch ändern (z. B. `g+s`, `o-rwx`, `u=rwx`)
- mit `chown` Besitzer und Gruppe ändern (`chown besitzer:gruppe datei`, `chown :gruppe datei`)
- mit `chgrp` die Gruppe einer Datei oder eines Verzeichnisses ändern
- entscheiden, welche Änderung nötig ist (Gruppe, Besitzer oder Rechte)
- begründen, warum Rechte für others möglichst vermieden werden
- die Reihenfolge von `chmod` und `chown` bewusst wählen und angeben, wann `sudo` dafür nötig ist

## SGID-Bit

- erklären, was das SGID-Bit bei einem Verzeichnis bewirkt
- das SGID-Bit setzen (`chmod g+s verzeichnis`)
- die Rechte danach oktal (`2775`) und symbolisch (`rwxrwsr-x`) angeben
- erklären, warum ein kleines `s` statt `x` angezeigt wird
- erklären, dass das SGID-Bit nicht rückwirkend wirkt
- begründen, wer das SGID-Bit setzen darf

## Dateien und Verzeichnisse verwalten

- mit `cd` wechseln und absolute und relative Pfade verwenden
- `.`, `..` und `~` richtig einsetzen
- mit `mkdir` Verzeichnisse anlegen, auch mit relativem Pfad aus einem anderen Verzeichnis
- mit `ls -l` ein bestimmtes Verzeichnis auflisten, ohne hineinzuwechseln
- vorhersagen, welche Rechte und welche Gruppe eine neu angelegte Datei hat (`umask`, SGID)
- mit `mv` verschieben, mit `cp` kopieren und mit `rm` löschen
- erklären, dass `cp` mit anschließendem `rm` dasselbe Ergebnis wie `mv` liefert

## Zugriff analysieren

- bei einem Zugriff den gesamten Pfad prüfen (`x` auf jedem übergeordneten Verzeichnis)
- entscheiden, ob jemand in ein Verzeichnis wechseln kann
- entscheiden, ob jemand ein Verzeichnis auflisten kann
- entscheiden, ob jemand Dateien oder Unterverzeichnisse anlegen kann
- entscheiden, ob jemand Dateien aus einem Verzeichnis kopieren kann
- Aussagen mit Verneinung („kann keine …“) richtig auswerten
- Änderungen aus früheren Schritten als neue Ausgangslage berücksichtigen
- ein Zugriffsproblem in ein bis zwei Sätzen analysieren und eine sparsame Lösung vorschlagen
