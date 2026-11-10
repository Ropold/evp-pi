# Übung 2: Linux-Rechteverwaltung Schritt für Schritt

> Quelle: `Uebung2_Linux_Rechte_Aufgaben.pdf` und `Uebung2_Linux_Rechte_Musterloesung.pdf`
> Teil A enthält die Aufgaben, Teil B die Musterlösung mit Hintergrund.

**Inhalt**

- [Teil A: Aufgaben](#teil-a-aufgaben)
- [Teil B: Musterlösung](#teil-b-musterlösung)
- [Abdeckung der Kannliste](#abdeckung-der-kannliste)

---

# Teil A: Aufgaben

## Hinweise

- Schreiben Sie alle Befehle vollständig und exakt auf (Befehl, Optionen, Argumente).
- Verwenden Sie `sudo` nur dort, wo es nötig ist.
- Rechte für others sollen Sie nur öffnen, wenn es ausdrücklich verlangt wird.
- Wenn nichts anderes steht, arbeiten Sie als Benutzer `tim`.
- Die Übung besteht aus sieben Teilen, die aufeinander aufbauen. Die Gruppenänderungen aus Teil 2 gelten bis zum Ende. Teile, die eine eigene Ausgangslage nennen, beginnen mit diesem Zustand.

## Ausgangslage

Die Firma NetzWerk GmbH betreibt den Linux-Server `srv01`. Dort liegen die Projektdaten unter `/srv/projekt`. Sie sind Praktikant `tim` und arbeiten von Ihrem Windows-Client aus.

| Benutzer | Rolle                 | Gruppen          |
|----------|-----------------------|------------------|
| anna     | Projektleiterin       | anna, projekt    |
| ben      | Entwickler            | ben, projekt     |
| carla    | externe Mitarbeiterin | carla, extern    |
| tim      | Sie (Praktikant)      | siehe Aufgabe 2  |

Jeder Benutzer hat eine Primärgruppe mit seinem Benutzernamen. Die Standard-umask von `tim` ist `0027`, für alle anderen Benutzer gilt `0022`. Auf dem Server ist kein SGID-Bit gesetzt, wenn es nicht ausdrücklich genannt wird. Von den vier Benutzern darf nur `tim` `sudo` verwenden.

---

## Teil 1: Anmelden und Orientieren (ping, ssh, man)

### Aufgabe 1

Sie sitzen an Ihrem Windows-Client und prüfen zuerst, ob der Server erreichbar ist.

```text
C:\Users\praktikant> ping srv01

Ping wird ausgeführt für srv01.netzwerk.lan [192.168.10.5] mit 32 Bytes Daten:
Antwort von 192.168.10.5: Bytes=32 Zeit<1ms TTL=64
Antwort von 192.168.10.5: Bytes=32 Zeit<1ms TTL=64
Antwort von 192.168.10.5: Bytes=32 Zeit<1ms TTL=64
Antwort von 192.168.10.5: Bytes=32 Zeit<1ms TTL=64

Ping-Statistik für 192.168.10.5:
    Pakete: Gesendet = 4, Empfangen = 4, Verloren = 0 (0% Verlust)
```

a) Ist `srv01` erreichbar? Wird der Name aufgelöst? Nennen Sie die IP-Adresse von `srv01` und begründen Sie Ihre Antworten anhand der Ausgabe. Auf welches Betriebssystem deutet der Wert `TTL=64` hin?

b) Melden Sie sich als `tim` per Secure Shell auf `srv01` an. Schreiben Sie den Befehl auf, einmal mit dem Rechnernamen und einmal mit der IP-Adresse.

c) Nach der Anmeldung zeigt das Terminal den Prompt `tim@srv01:~$`. Wofür stehen die Teile `tim`, `srv01`, `~` und `$`?

d) Sie wissen nicht mehr, wie `chown` verwendet wird. Nennen Sie zwei Möglichkeiten, sich die Syntax am Terminal anzeigen zu lassen (jeweils mit Befehl).

e) Sie lesen den folgenden Auszug aus der Kurzhilfe. Schreiben Sie den Befehl auf, der alle Einträge des aktuellen Verzeichnisses einschließlich der versteckten im ausführlichen Listenformat anzeigt.

```text
tim@srv01:~$ ls --help
Aufruf: ls [OPTION]... [DATEI]...
Auflistung der DATEIen (standardmäßig das aktuelle Verzeichnis).

  -a, --all        Einträge, die mit . beginnen, nicht ignorieren
  -d, --directory  Verzeichnisse selbst auflisten, nicht deren Inhalt
  -l               ausführliches Listenformat verwenden
```

---

## Teil 2: Benutzer und Gruppen (id, adduser, usermod, sudo)

### Aufgabe 2

Nach der Anmeldung geben Sie `id` ein und lassen sich außerdem die Gruppen von `carla` anzeigen.

```text
tim@srv01:~$ id
uid=1004(tim) gid=1004(tim) Gruppen=1004(tim),27(sudo)

tim@srv01:~$ id carla
uid=1003(carla) gid=1003(carla) Gruppen=1003(carla),1011(extern)
```

a) Welche UID und welche GID hat `tim`? Wie heißt seine Primärgruppe, welche weiteren Gruppen hat er?

b) Was bedeutet die Mitgliedschaft in der Gruppe `sudo` für `tim`?

c) Wie heißt carlas Primärgruppe, wie ihre weitere Gruppe? Mit welchem Befehl würden Sie die Gruppen von `ben` anzeigen?

d) Erklären Sie den Unterschied zwischen Primärgruppe und weiteren Gruppen. Welche Gruppe erhält eine neu angelegte Datei normalerweise?

e) Werten Sie die Tabelle der Ausgangslage aus: Wer ist Mitglied der Gruppe `projekt`, wer der Gruppe `extern`?

### Aufgabe 3

Damit Sie als Praktikant mit den Projektdaten arbeiten können, soll `tim` Mitglied der Gruppe `projekt` werden.

a) Schreiben Sie den Befehl auf, der das erledigt (mit `adduser`).

b) Warum ist hier `sudo` nötig?

c) Direkt danach geben Sie in derselben Sitzung `id` ein. Die Gruppe `projekt` steht noch nicht in der Liste. Erklären Sie, warum, und sagen Sie, was Sie tun müssen.

d) Woran erkennen Sie anschließend, dass die Änderung wirksam ist?

### Aufgabe 4

Ben soll zusätzlich Mitglied der Gruppe `extern` werden, damit er mit carla Dateien austauschen kann. Verwenden Sie dieses Mal `usermod`.

a) Schreiben Sie den Befehl auf.

b) Wofür steht die Option `-a`? Was würde ohne diese Option passieren?

c) Ein Kollege sagt: „Ich setze vor jeden Befehl `sudo`, dann geht immer alles." Sie wollen nur Bens Gruppen ansehen und tippen `sudo id ben`. Beurteilen Sie das und nennen Sie zwei Gründe, warum man `sudo` nicht unnötig verwendet.

---

## Teil 3: Rechte lesen (ls -l, ls -ld)

### Aufgabe 5

```text
tim@srv01:~$ ls -l /srv/projekt/doku
insgesamt 12
drwxrwx--- 2 anna projekt 4096 Nov  2 16:48 archiv
-r--rw---- 1 anna projekt 1520 Nov  4 14:20 budget.txt
-rw-r--r-- 1 anna anna    2048 Nov  3 10:15 konzept.txt
```

Tragen Sie die Angaben zu `archiv` und `konzept.txt` in die Tabelle ein.

| Eintrag     | Typ | Besitzer | Gruppe | Größe | Datum | Rechte Besitzer | Rechte Gruppe | Rechte others |
|-------------|-----|----------|--------|-------|-------|-----------------|---------------|---------------|
| archiv      |     |          |        |       |       |                 |               |               |
| konzept.txt |     |          |        |       |       |                 |               |               |

### Aufgabe 6

Beschreiben Sie, was die Rechte `r`, `w` und `x` jeweils bei einer Datei und bei einem Verzeichnis bedeuten.

| Recht | Bei einer Datei | Bei einem Verzeichnis |
|-------|-----------------|-----------------------|
| r     |                 |                       |
| w     |                 |                       |
| x     |                 |                       |

### Aufgabe 7

Rechnen Sie um: links stehen Rechte in symbolischer Schreibweise, rechts in oktaler Schreibweise.

| symbolisch  | oktal |     | oktal | symbolisch |
|-------------|-------|-----|-------|------------|
| `rwxr-x---` |       |     | `700` |            |
| `rw-r-----` |       |     | `644` |            |
| `rwxrwxr-x` |       |     | `770` |            |

### Aufgabe 8

Betrachten Sie die Datei `budget.txt` aus Aufgabe 5 (`-r--rw---- 1 anna projekt`). Berücksichtigen Sie nur die Rechte der Datei selbst, nicht den Weg dorthin. Tragen Sie ein, welche Rechtegruppe für die Person gilt, welche Rechte sie dort hat und ob sie die Datei ändern darf.

| Person | gilt: Besitzer / Gruppe / others | Rechte | darf schreiben? |
|--------|----------------------------------|--------|-----------------|
| anna   |                                  |        |                 |
| ben    |                                  |        |                 |
| carla  |                                  |        |                 |
| tim    |                                  |        |                 |

Anna ist ebenfalls Mitglied der Gruppe `projekt`. Warum gelten für sie trotzdem nicht die Rechte `rw-`?

### Aufgabe 9

Sie verschaffen sich einen Überblick über die Verzeichnisse unter `/srv/projekt`.

```text
tim@srv01:~$ ls -ld /srv/projekt
drwxr-x--- 5 root projekt 4096 Nov  2 08:00 /srv/projekt

tim@srv01:~$ ls -l /srv/projekt
insgesamt 12
drwxrwx--- 2 anna extern  4096 Nov  3 09:20 austausch
drwxrwx--- 3 ben  projekt 4096 Nov  3 09:12 code
drwxrwx--- 3 anna projekt 4096 Nov  2 16:48 doku

tim@srv01:~$ ls -l /srv/projekt/code
insgesamt 4
drwxr-xr-x 2 ben projekt 4096 Nov  3 09:12 build
```

Ergänzen Sie in der Baumdarstellung alle mit `[?]` gekennzeichneten Angaben (Rechte oktal).

```text
/srv/projekt      root : projekt   [?]
├── doku          anna : projekt   770
├── code          [?]  : [?]       [?]
│   └── build     ben  : [?]       [?]
└── austausch     anna : extern    [?]
```

---

## Teil 4: Dateien und Verzeichnisse verwalten (cd, mkdir, ls, cp, mv, rm)

### Aufgabe 10

Sie sind angemeldet und befinden sich im Home-Verzeichnis von `tim` (`/home/tim`).

```text
tim@srv01:~$
```

a) Wechseln Sie mit einer absoluten Pfadangabe nach `/srv/projekt/doku`.

b) Wie lautet der Prompt danach?

c) Wechseln Sie von dort mit einer relativen Pfadangabe nach `/srv/projekt/code`.

d) Wechseln Sie zurück in Ihr Home-Verzeichnis.

e) Sie stehen wieder in `/home/tim`. Wechseln Sie mit einer relativen Pfadangabe (ohne `~`, ohne `/` am Anfang) nach `/srv/projekt/doku`.

f) Erklären Sie die Bedeutung von `.`, `..` und `~`.

### Aufgabe 11

Sie stehen in `/srv/projekt` und möchten, ohne das Verzeichnis zu wechseln, einen Testordner anlegen.

```text
tim@srv01:/srv/projekt$
```

a) Legen Sie das Verzeichnis `testlauf` im Verzeichnis `code` an (relativer Pfad, ohne `cd`).

b) Warum funktioniert der Befehl ohne `sudo`?

c) Zeigen Sie den Inhalt von `code` im ausführlichen Format an, ohne dorthin zu wechseln. Schreiben Sie den Befehl auf.

d) Ergänzen Sie die Zeile für `testlauf` in der Ausgabe des Befehls aus c):

```text
insgesamt 8
drwxr-xr-x 2 ben   projekt 4096 Nov 10 09:17 build
__________ 2 _____ _____   4096 Nov 10 09:20 testlauf
```

### Aufgabe 12

Sie legen in Ihrem Home-Verzeichnis zwei neue Einträge an.

```text
tim@srv01:~$ touch ideen.txt
tim@srv01:~$ mkdir skizzen
```

a) Ergänzen Sie die Tabelle für die beiden neuen Einträge.

| Eintrag   | Rechte symbolisch | Rechte oktal | Besitzer | Gruppe |
|-----------|-------------------|--------------|----------|--------|
| ideen.txt |                   |              |          |        |
| skizzen   |                   |              |          |        |

b) Zeigen Sie die Rechnung für `ideen.txt`: Ausgangsrechte `666`, umask `0027`.

c) Welche Rechte (oktal) hätten die beiden Einträge, wenn `anna` sie angelegt hätte?

### Aufgabe 13

Im Home-Verzeichnis von `tim` liegen die Dateien `bericht.txt` und `notiz.txt`. Sie arbeiten mit dem Prompt `tim@srv01:~$`.

a) Kopieren Sie `bericht.txt` in das Verzeichnis `/srv/projekt/doku`. Das Original soll erhalten bleiben.

b) Verschieben Sie `notiz.txt` in das Verzeichnis `/srv/projekt/code`.

c) Wie erreichen Sie dasselbe Ergebnis wie in b) mit den beiden Befehlen `cp` und `rm`? Schreiben Sie beide Befehle auf.

d) Was liegt nach a) und was nach b) noch in Ihrem Home-Verzeichnis?

---

## Teil 5: Rechte und Eigentümer ändern (chmod, chown, chgrp)

### Aufgabe 14

Sie arbeiten im Home-Verzeichnis (`tim@srv01:~$`). Dort liegen der Ordner `skizzen` und die Datei `ideen.txt`. Beide gehören `tim`.

a) `skizzen` soll nur für `tim` zugänglich sein (Lesen, Schreiben, Betreten), für alle anderen gar nicht. Schreiben Sie den `chmod`-Befehl mit oktalen Rechten auf.

b) `ideen.txt` soll für Besitzer und Gruppe les- und schreibbar sein, für others gesperrt. Schreiben Sie den `chmod`-Befehl mit oktalen Rechten auf.

c) Geben Sie die Rechte aus a) und b) in symbolischer Schreibweise an.

### Aufgabe 15

Weiterhin im Home-Verzeichnis. Dort liegen `bericht.txt` (`-rw-r-----`), `weitergabe.txt` (`-rw-r--r--`) und der Ordner `material` (`drwxr-xr-x`). Verwenden Sie diesmal die symbolische Schreibweise.

a) Die Gruppe soll `bericht.txt` zusätzlich beschreiben dürfen.

b) Bei `weitergabe.txt` sollen für others alle Rechte entfernt werden.

c) Für `material` sollen mit einem einzigen Befehl die Rechte genau auf `rwx` für den Besitzer und keine Rechte für Gruppe und others gesetzt werden.

### Aufgabe 16

Entscheiden Sie in jeder Situation, was geändert werden muss (Besitzer, Gruppe oder Rechte). Schreiben Sie den passenden Befehl auf und geben Sie an, ob `sudo` nötig ist.

```text
(1) tim@srv01:~$ ls -l entwurf.txt
    -rw-r----- 1 tim projekt 640 Nov 10 08:30 entwurf.txt
    Ziel: Alle Mitglieder von projekt sollen die Datei ändern dürfen.

(2) tim@srv01:~$ ls -l /srv/projekt/doku/angebot.txt
    -rw-rw---- 1 anna anna 1500 Nov 10 08:35 /srv/projekt/doku/angebot.txt
    Ziel: Alle Mitglieder von projekt sollen die Datei ändern dürfen.

(3) tim@srv01:~$ ls -l /srv/projekt/code/export.csv
    -rw-rw---- 1 tim projekt 3200 Nov 10 08:40 /srv/projekt/code/export.csv
    Ziel: Die Datei soll anna gehören.
```

| Nr. | Was muss geändert werden? | Befehl | sudo nötig? |
|-----|---------------------------|--------|-------------|
| (1) |                           |        |             |
| (2) |                           |        |             |
| (3) |                           |        |             |

### Aufgabe 17

Sie haben `bericht.txt` als `protokoll.txt` nach `/srv/projekt/doku` kopiert. Ben meldet ein Problem.

```text
ben@srv01:~$ cat /srv/projekt/doku/protokoll.txt
cat: /srv/projekt/doku/protokoll.txt: Keine Berechtigung

tim@srv01:~$ ls -l /srv/projekt/doku/protokoll.txt
-rw-r----- 1 tim tim 733 Nov 10 09:05 /srv/projekt/doku/protokoll.txt
```

a) Analysieren Sie die Ausgangslage in ein bis zwei Sätzen: Warum darf `ben` die Datei nicht lesen?

b) Schreiben Sie einen Befehl auf, der das Problem löst, ohne unnötige Rechte zu vergeben (Prompt `tim@srv01:~$`, absoluter Pfad).

c) Nennen Sie einen gleichwertigen Befehl mit einem anderen Programm.

d) Warum sind `chmod o+r ...` und das Hinzufügen von `ben` zur Gruppe `tim` keine guten Lösungen?

### Aufgabe 18

Die Datei `/srv/projekt/doku/plan.txt` gehört `tim` (Gruppe `tim`, Rechte `rw-r-----`). Sie soll künftig den Besitzer `anna` und die Gruppe `projekt` haben und die Rechte `rw-rw----` erhalten. Sie stehen im Verzeichnis `/srv/projekt/doku`.

```text
tim@srv01:/srv/projekt/doku$
```

a) Schreiben Sie die Befehle (relative Pfade) in einer Reihenfolge auf, bei der `sudo` nur einmal benötigt wird.

b) Begründen Sie die Reihenfolge. Was passiert, wenn Sie zuerst den Besitzer ändern und `chmod` danach ohne `sudo` ausführen?

---

## Teil 6: Das SGID-Bit (chmod g+s)

**Ausgangslage Teil 6:**

```text
tim@srv01:~$ ls -ld /srv/projekt/doku
drwxrwx--- 3 anna projekt 4096 Nov  2 16:48 /srv/projekt/doku

tim@srv01:~$ ls -l /srv/projekt/doku/konzept.txt
-rw-r--r-- 1 anna anna 2048 Nov  3 10:15 /srv/projekt/doku/konzept.txt
```

Alle Dateien und Ordner, die in `/srv/projekt/doku` angelegt werden, sollen künftig automatisch der Gruppe `projekt` gehören, egal wer sie anlegt.

### Aufgabe 19

a) Welcher Gruppe würde eine Datei gehören, die `ben` jetzt in `doku` anlegt?

b) Welche Einstellung bewirkt das gewünschte Verhalten? Erklären Sie ihre Wirkung in ein bis zwei Sätzen.

c) Schreiben Sie den Befehl auf, mit dem `tim` diese Einstellung vornimmt (absoluter Pfad).

d) Wer dürfte den Befehl ohne `sudo` ausführen und warum?

### Aufgabe 20

a) Ergänzen Sie die Rechte von `doku` vor und nach der Änderung aus Aufgabe 19.

| Zeitpunkt | symbolisch | oktal |
|-----------|------------|-------|
| vorher    |            |       |
| nachher   |            |       |

b) Warum steht in der Anzeige ein kleines `s` und kein `x`?

### Aufgabe 21

Nach der Änderung legt `ben` (umask `0022`) in `doku` die Datei `neu.txt` und den Ordner `unterordner` an. `konzept.txt` existierte schon vorher.

a) Ergänzen Sie die Tabelle.

| Eintrag     | Besitzer | Gruppe | Rechte (symbolisch) |
|-------------|----------|--------|---------------------|
| neu.txt     |          |        |                     |
| unterordner |          |        |                     |
| konzept.txt |          |        |                     |

b) Warum ist die Gruppe von `konzept.txt` unverändert geblieben?

c) Wie bekommt `konzept.txt` nachträglich die Gruppe `projekt`? Schreiben Sie den Befehl als `tim` auf.

---

## Teil 7: Zugriff analysieren

Für Teil 7 gilt dieser Zustand (Ergebnis der Teile 2 bis 6):

| Pfad                            | Besitzer : Gruppe | Rechte              |
|---------------------------------|-------------------|---------------------|
| `/srv/projekt`                  | root : projekt    | `drwxr-x---` (750)  |
| `/srv/projekt/doku`             | anna : projekt    | `drwxrws---` (2770) |
| `/srv/projekt/doku/konzept.txt` | anna : projekt    | `-rw-r--r--` (644)  |
| `/srv/projekt/code`             | ben : projekt     | `drwxrwx---` (770)  |
| `/srv/projekt/code/build`       | ben : projekt     | `drwxr-xr-x` (755)  |
| `/srv/projekt/austausch`        | anna : extern     | `drwxrwx---` (770)  |

| Benutzer | Gruppen               |
|----------|-----------------------|
| anna     | anna, projekt         |
| ben      | ben, projekt, extern  |
| carla    | carla, extern         |
| tim      | tim, sudo, projekt    |

### Aufgabe 22

Tragen Sie ein, ob die Person die Aktion ausführen kann (ja/nein).

| Aktion                                                         | anna | ben | carla | tim |
|----------------------------------------------------------------|------|-----|-------|-----|
| a) Inhalt von `/srv/projekt/doku` auflisten                    |      |     |       |     |
| b) in das Verzeichnis `/srv/projekt/code/build` wechseln       |      |     |       |     |
| c) in `/srv/projekt/code/build` eine neue Datei anlegen        |      |     |       |     |
| d) Inhalt von `/srv/projekt/austausch` auflisten               |      |     |       |     |
| e) `/srv/projekt/doku/konzept.txt` nach `/srv/projekt/austausch` kopieren |  |  |    |     |

Begründen Sie in je einem Satz: carla in Zeile a), tim in Zeile d), anna in Zeile c).

### Aufgabe 23

Alle folgenden Aussagen sind falsch. Korrigieren Sie jede Aussage so, dass sie stimmt, und begründen Sie Ihre Korrektur.

1. `ben` kann in `/srv/projekt/doku` keine Dateien anlegen.
2. `carla` kann `/srv/projekt/austausch` auflisten, weil sie Mitglied der Gruppe `extern` ist.
3. `tim` kann nicht in das Verzeichnis `/srv/projekt/code/build` wechseln.
4. `anna` kann in `/srv/projekt/code/build` Dateien anlegen, da sie Mitglied der Gruppe `projekt` ist.

### Aufgabe 24

Carla meldet ein Problem.

```text
carla@srv01:~$ ls /srv/projekt/austausch
ls: Zugriff auf '/srv/projekt/austausch' nicht möglich: Keine Berechtigung
```

a) Analysieren Sie die Ausgangslage in ein bis zwei Sätzen: Warum hat `carla` keinen Zugriff, obwohl sie Mitglied der Gruppe `extern` ist?

b) Warum wäre es keine gute Lösung, `carla` in die Gruppe `projekt` aufzunehmen?

c) Die Projektleitung erlaubt ausdrücklich, dass alle Benutzer `/srv/projekt` durchqueren, aber nicht auflisten dürfen. Schreiben Sie den Befehl auf, den `tim` dafür ausführt.

d) Der Befehl aus c) ist ausgeführt und gilt als neue Ausgangslage. Beantworten Sie für `carla` mit ja/nein und einer kurzen Begründung:

| Aktion                                  | ja/nein | Begründung |
|-----------------------------------------|---------|------------|
| (1) `/srv/projekt/austausch` auflisten  |         |            |
| (2) `/srv/projekt` auflisten            |         |            |
| (3) in `/srv/projekt/doku` wechseln     |         |            |
| (4) in `/srv/projekt/code` wechseln     |         |            |

### Aufgabe 25

Beschreiben Sie in drei Schritten, wie Sie vorgehen, um zu prüfen, ob eine Person auf ein Ziel zugreifen kann (zum Beispiel eine Datei in einem Unterverzeichnis anlegen). Nennen Sie dabei, welche Rechte zum Auflisten, Wechseln, Lesen und Anlegen nötig sind.

---

# Teil B: Musterlösung

Alle Befehle und Ergebnisse wurden auf einem Ubuntu-System mit demselben Aufbau (Benutzer, Gruppen, Verzeichnisse, umask) praktisch getestet. Zu jeder Aufgabe folgt nach der Lösung ein Hintergrundabschnitt.

## Teil 1: Anmelden und Orientieren

### Aufgabe 1

a) Ja, `srv01` ist erreichbar: 4 Pakete gesendet, 4 empfangen, 0 % Verlust. Der Name wird aufgelöst: aus `srv01` wurde `srv01.netzwerk.lan [192.168.10.5]`. IP-Adresse: `192.168.10.5`. `TTL=64` deutet auf ein Linux-System hin (Windows startet meist mit 128).

b) `ssh tim@srv01` und `ssh tim@192.168.10.5`

c) `tim` = angemeldeter Benutzer, `srv01` = Rechnername, `~` = aktuelles Verzeichnis (hier das Home-Verzeichnis), `$` = normaler Benutzer (bei root steht `#`).

d) `man chown` (Handbuchseite) und `chown --help` (Kurzhilfe).

e) `ls -la` (gleichwertig `ls -l -a` oder `ls -al`)

> **Hintergrund:** `ping` sendet Echo-Anfragen (ICMP) und misst die Antwortzeit. Der Name `srv01` wird über DNS in die IP-Adresse aufgelöst. Die TTL (Time to Live) sinkt bei jedem Router um 1. Weil Client und Server im selben Netz stehen, bleibt der Startwert des Servers sichtbar: 64 bei Linux, 128 bei Windows. `ssh benutzer@rechner` baut eine verschlüsselte Verbindung (Port 22) auf. Beim ersten Mal fragt SSH nach dem Fingerabdruck des Servers, danach nach dem Passwort. Der Prompt hat die Form `benutzer@rechner:verzeichnis$`.
> `man` öffnet die ausführliche Anleitung (Beenden mit `q`), `--help` zeigt eine Kurzfassung. Dateien, deren Name mit einem Punkt beginnt, sind versteckt und erscheinen erst mit `-a`. Mehrere Optionen darf man zusammenschreiben (`-la`).

## Teil 2: Benutzer und Gruppen

### Aufgabe 2

a) UID 1004, GID 1004. Primärgruppe: `tim`. Weitere Gruppe: `sudo`.

b) `tim` darf Befehle mit vorangestelltem `sudo` mit Administratorrechten (root) ausführen.

c) carlas Primärgruppe ist `carla`, ihre weitere Gruppe `extern`. Gruppen von ben: `id ben`.

d) Die Primärgruppe ist die Standardgruppe eines Benutzers (gid). Neu angelegte Dateien erhalten sie als Gruppe. Weitere Gruppen sind zusätzliche Mitgliedschaften, sie geben nur zusätzliche Zugriffsrechte.

e) `projekt`: anna, ben. `extern`: carla.

> **Hintergrund:** Benutzer stehen in `/etc/passwd`, Gruppen in `/etc/group`. In der Tabelle der Ausgangslage steht die Primärgruppe zuerst. `id` zeigt die Gruppen, wie sie der aktuellen Sitzung zugeordnet sind.

### Aufgabe 3

a) `sudo adduser tim projekt` (gleichwertig `sudo usermod -aG projekt tim` oder `sudo addgroup tim projekt`)

b) Die Gruppenverwaltung ändert Systemdateien (`/etc/group`). Das darf nur root. `tim` ist in der Gruppe `sudo` und kann deshalb `sudo` verwenden.

c) Gruppenmitgliedschaften werden beim Anmelden gelesen und der Sitzung mitgegeben. Die laufende Shell kennt noch die alte Liste. `tim` muss sich abmelden (`exit`) und neu mit `ssh tim@srv01` anmelden.

d) `id` zeigt dann `Gruppen=1004(tim),27(sudo),1010(projekt)`.

> **Hintergrund:** Die Änderung steht sofort in `/etc/group`, aber bereits laufende Prozesse behalten ihre Gruppenliste. `adduser benutzer gruppe` mit zwei Namen ist eine Debian/Ubuntu-Schreibweise. Ab hier gilt: `tim` ist Mitglied in `projekt`.

### Aufgabe 4

a) `sudo usermod -aG extern ben`

b) `-a` bedeutet anhängen (append), `-G` nennt die zusätzlichen Gruppen. Ohne `-a` würde die gesamte Liste ersetzt: ben wäre danach nur noch in `extern` und nicht mehr in `projekt` und würde seinen Zugriff auf die Projektdaten verlieren.

c) `sudo` ist hier überflüssig, denn `id ben` braucht keine besonderen Rechte. Gründe gegen unnötiges `sudo`:
1. Fehler und Tippfehler wirken dann mit Administratorrechten und können Schaden anrichten.
2. Dateien, die mit `sudo` angelegt werden, gehören root und verursachen später Rechteprobleme.

> **Hintergrund:** Prinzip der minimalen Rechte (Least Privilege): Jeder Benutzer und jeder Befehl bekommt nur so viele Rechte wie nötig. Auch das Protokoll in `/var/log/auth.log` wird übersichtlicher, wenn `sudo` selten ist.

## Teil 3: Rechte lesen

### Aufgabe 5

| Eintrag     | Typ         | Besitzer | Gruppe  | Größe | Datum        | Rechte Besitzer | Rechte Gruppe | Rechte others |
|-------------|-------------|----------|---------|-------|--------------|-----------------|---------------|---------------|
| archiv      | Verzeichnis | anna     | projekt | 4096  | Nov 2 16:48  | rwx             | rwx           | ---           |
| konzept.txt | Datei       | anna     | anna    | 2048  | Nov 3 10:15  | rw-             | r--           | r--           |

> **Hintergrund:** Eine Zeile von `ls -l` lautet: Typ (`-` Datei, `d` Verzeichnis, `l` Link), dreimal drei Rechte (Besitzer, Gruppe, others), Anzahl der Links (hier nicht gefragt), Besitzer, Gruppe, Größe in Byte, Datum der letzten Änderung, Name. Bei Verzeichnissen steht meist 4096, das ist die Größe des Verzeichniseintrags, nicht des Inhalts.

### Aufgabe 6

| Recht | Bei einer Datei                     | Bei einem Verzeichnis                                              |
|-------|-------------------------------------|--------------------------------------------------------------------|
| r     | Inhalt lesen                        | Inhalt auflisten (Namen der Einträge sehen)                        |
| w     | Inhalt ändern                       | Einträge anlegen, löschen und umbenennen (nur zusammen mit x)      |
| x     | als Programm oder Skript ausführen  | in das Verzeichnis wechseln und auf die Einträge zugreifen         |

> **Hintergrund:** Ein Verzeichnis ist eine Liste von Namen. `r` erlaubt, die Liste zu lesen, `x` erlaubt, durch das Verzeichnis „hindurchzugehen". Das Löschen einer Datei hängt deshalb von den Rechten des Verzeichnisses (`w` und `x`) ab, nicht von den Rechten der Datei.

### Aufgabe 7

| symbolisch  | oktal |     | oktal | symbolisch  |
|-------------|-------|-----|-------|-------------|
| `rwxr-x---` | 750   |     | `700` | `rwx------` |
| `rw-r-----` | 640   |     | `644` | `rw-r--r--` |
| `rwxrwxr-x` | 775   |     | `770` | `rwxrwx---` |

> **Hintergrund:** Jede Rechtegruppe ist eine Summe: `r` = 4, `w` = 2, `x` = 1. Die drei Ziffern gelten der Reihe nach für Besitzer, Gruppe und others. Beispiel `rwxr-x---`: 4+2+1 = 7, 4+0+1 = 5, 0 → `750`.

### Aufgabe 8

| Person | gilt                                | Rechte | darf schreiben? |
|--------|-------------------------------------|--------|-----------------|
| anna   | Besitzer                            | r--    | nein            |
| ben    | Gruppe                              | rw-    | ja              |
| carla  | others                              | ---    | nein            |
| tim    | Gruppe (seit Aufgabe 3 in projekt)  | rw-    | ja              |

Anna ist Besitzerin. Die Klasse „Besitzer" wird zuerst geprüft, und der erste Treffer entscheidet. Dass die Gruppe `rw-` hätte, spielt für anna keine Rolle.

> **Hintergrund:** Linux prüft in der Reihenfolge Besitzer, Gruppe, others und wendet nur die erste passende Klasse an. Die Rechte werden nie zusammengezählt. Deshalb kann ein Besitzer weniger Rechte haben als die Gruppe seiner eigenen Datei.

### Aufgabe 9

```text
/srv/projekt      root : projekt   750
├── doku          anna : projekt   770
├── code          ben  : projekt   770
│   └── build     ben  : projekt   755
└── austausch     anna : extern    770
```

> **Hintergrund:** `ls -ld verzeichnis` zeigt das Verzeichnis selbst, `ls -l verzeichnis` seinen Inhalt. Die Rechte `drwxrwx---` ergeben 770, `drwxr-xr-x` ergeben 755. Die Zahl nach den Rechten ist die Linkzahl: 2 plus die Anzahl der Unterverzeichnisse, daher 5 bei `/srv/projekt` (drei Unterverzeichnisse).

## Teil 4: Dateien und Verzeichnisse verwalten

### Aufgabe 10

a) `cd /srv/projekt/doku`

b) `tim@srv01:/srv/projekt/doku$`

c) `cd ../code`

d) `cd ~` (oder nur `cd`)

e) `cd ../../srv/projekt/doku` (`..` = `/home`, `../..` = `/`)

f) `.` = aktuelles Verzeichnis, `..` = übergeordnetes Verzeichnis, `~` = Home-Verzeichnis des angemeldeten Benutzers.

> **Hintergrund:** Absolute Pfade beginnen mit `/` und gelten von überall. Relative Pfade beginnen im aktuellen Verzeichnis. Dass `tim` überall hinkommt, liegt an seiner Mitgliedschaft in `projekt` (Aufgabe 3): `/srv/projekt` hat für die Gruppe `r-x`. `cd -` springt zusätzlich zum zuletzt besuchten Verzeichnis zurück.

### Aufgabe 11

a) `mkdir code/testlauf` (gleichwertig `mkdir ./code/testlauf`)

b) `code` gehört `ben:projekt` mit 770. `tim` ist Mitglied von `projekt`, die Gruppe hat `rwx`, also darf `tim` dort anlegen.

c) `ls -l code`

d) `drwxr-x--- 2 tim tim 4096 Nov 10 09:20 testlauf`

> **Hintergrund:** Zum Anlegen braucht man `w` und `x` im Elternverzeichnis. Neue Verzeichnisse starten mit 777, die umask 0027 entzieht 027, daraus wird 750. Die Gruppe ist tims Primärgruppe `tim`, weil kein SGID-Bit gesetzt ist.

### Aufgabe 12

a)

| Eintrag   | Rechte symbolisch | Rechte oktal | Besitzer | Gruppe |
|-----------|-------------------|--------------|----------|--------|
| ideen.txt | `rw-r-----`       | 640          | tim      | tim    |
| skizzen   | `rwxr-x---`       | 750          | tim      | tim    |

b) Besitzer 6 − 0 = 6, Gruppe 6 − 2 = 4, others 6 − 7 → 0. Ergebnis `640`. (Verzeichnis: 777 − 027 = 750.)

c) anna (umask 0022): Datei `644`, Verzeichnis `755`.

> **Hintergrund:** Die umask legt fest, welche Rechte neuen Einträgen entzogen werden. Dateien starten mit 666, weil neue Dateien nie automatisch ausführbar sein sollen, Verzeichnisse mit 777. Genau genommen werden die Bits der umask gelöscht, es ist keine normale Subtraktion. Die aktuelle umask zeigt der Befehl `umask`.

### Aufgabe 13

a) `cp bericht.txt /srv/projekt/doku/`

b) `mv notiz.txt /srv/projekt/code/`

c) `cp notiz.txt /srv/projekt/code/` und danach `rm notiz.txt`

d) Nach a) liegt `bericht.txt` noch im Home-Verzeichnis (Kopie). Nach b) ist `notiz.txt` nicht mehr im Home-Verzeichnis.

> **Hintergrund:** `cp` erzeugt eine neue Datei: Besitzer ist der ausführende Benutzer, die Rechte ergeben sich aus der Quelle und der umask, der Zeitstempel ist neu. `mv` ändert innerhalb eines Dateisystems nur den Verzeichniseintrag, Besitzer, Rechte und Zeitstempel bleiben erhalten. `mv` über Dateisystemgrenzen kopiert und löscht. `rm` löscht endgültig, es gibt keinen Papierkorb. Ordner brauchen `cp -r` und `rm -r`. `sudo` ist nicht nötig, weil `doku` und `code` der Gruppe `projekt` gehören und `rwx` erlauben.

## Teil 5: Rechte und Eigentümer ändern

### Aufgabe 14

a) `chmod 700 skizzen`

b) `chmod 660 ideen.txt`

c) a) `rwx------`, b) `rw-rw----`

> **Hintergrund:** Die oktale Schreibweise setzt alle neun Rechtebits auf einmal. `chmod` darf nur der Besitzer (oder root). `tim` ist Besitzer, deshalb kein `sudo`.

### Aufgabe 15

a) `chmod g+w bericht.txt`

b) `chmod o-rwx weitergabe.txt`

c) `chmod u=rwx,g=,o= material` (gleichwertig `chmod 700 material`)

> **Hintergrund:** Symbolisch: Klasse `u` (Besitzer), `g` (Gruppe), `o` (others) oder `a` (alle), dann `+` (hinzufügen), `-` (entfernen) oder `=` (genau setzen), dann `r`, `w`, `x` und bei Verzeichnissen `s`. Bei `=` entfallen alle nicht genannten Rechte der Klasse. Mehrere Angaben trennt man mit Komma. Die symbolische Schreibweise ändert gezielt einzelne Rechte, die oktale setzt alles neu.

### Aufgabe 16

| Nr. | Was muss geändert werden?                           | Befehl                                             | sudo nötig?                               |
|-----|-----------------------------------------------------|----------------------------------------------------|-------------------------------------------|
| (1) | Rechte (die Gruppe projekt ist richtig, g hat nur `r--`) | `chmod g+w entwurf.txt`                       | nein, tim ist Besitzer                    |
| (2) | Gruppe (Rechte `rw-rw----` stimmen schon)           | `sudo chgrp projekt /srv/projekt/doku/angebot.txt` | ja, tim ist nicht Besitzer                |
| (3) | Besitzer                                            | `sudo chown anna /srv/projekt/code/export.csv`     | ja, nur root darf den Besitzer ändern     |

> **Hintergrund:** Zuerst klären, was nicht stimmt: Rechte, Gruppe oder Besitzer? Wer darf was? `chmod`: der Besitzer (oder root). `chgrp`: der Besitzer, aber nur auf Gruppen, in denen er selbst Mitglied ist (oder root). `chown` auf einen anderen Besitzer: nur root. Gleichwertig zu `chgrp projekt datei` ist `chown :projekt datei`.

### Aufgabe 17

a) ben ist weder Besitzer der Datei noch Mitglied der Gruppe `tim`. Für ihn gilt deshalb die Klasse others mit `---`. Der Weg zur Datei ist frei, ben ist ja Mitglied von `projekt`.

b) `chgrp projekt /srv/projekt/doku/protokoll.txt`

c) `chown :projekt /srv/projekt/doku/protokoll.txt` (auch `chown tim:projekt ...`)

d) `chmod o+r` öffnet die Datei für alle Benutzer des Servers und widerspricht dem Prinzip, others nur ausdrücklich zu öffnen. ben in die Gruppe `tim` aufzunehmen, gäbe ihm Zugriff auf alles, was der Gruppe `tim` gehört, und erfordert `sudo`.

> **Hintergrund:** Nach `chgrp` steht `-rw-r----- tim projekt`. Die Gruppe darf lesen, das genügt ben. Soll ben auch schreiben, braucht es zusätzlich `chmod g+w`. Kein `sudo` nötig: tim ist Besitzer und selbst Mitglied von `projekt`. Ein normaler Benutzer darf die Gruppe seiner Dateien nur auf Gruppen ändern, in denen er Mitglied ist.

### Aufgabe 18

a) Reihenfolge mit nur einem `sudo`:

```text
tim@srv01:/srv/projekt/doku$ chmod 660 plan.txt
tim@srv01:/srv/projekt/doku$ sudo chown anna:projekt plan.txt
```

b) `chmod` darf nur der Besitzer. Solange tim noch Besitzer ist, braucht er dafür kein `sudo`. Den Besitzer auf einen anderen Benutzer zu ändern darf nur root, dafür ist `sudo` nötig. Wird zuerst `chown` ausgeführt, gehört die Datei anna. Ein `chmod 660 plan.txt` ohne `sudo` scheitert dann mit der Meldung „Die Operation ist nicht erlaubt" (Operation not permitted). Mit `sudo` ginge es, bräuchte aber zwei `sudo`-Aufrufe.

> **Hintergrund:** Merkregel: Erst `chmod` und `chgrp`, solange man Besitzer ist, zuletzt `chown` auf einen anderen Besitzer. `chown anna:projekt` setzt Besitzer und Gruppe in einem Schritt, `chown :projekt` nur die Gruppe, `chown anna` nur den Besitzer.

## Teil 6: Das SGID-Bit

### Aufgabe 19

a) `ben` (seiner Primärgruppe).

b) Das SGID-Bit (Set Group ID) am Verzeichnis `doku`. Neue Dateien und Unterverzeichnisse darin erben die Gruppe des Verzeichnisses (`projekt`) statt der Primärgruppe des Erstellers.

c) `sudo chmod g+s /srv/projekt/doku`

d) anna, denn sie ist Besitzerin von `doku`. Nur der Besitzer (oder root) darf `chmod` ausführen. tim ist nicht Besitzer und braucht deshalb `sudo`; ohne `sudo` kommt „Operation not permitted".

> **Hintergrund:** Spezialrechte sind SUID (4), SGID (2) und Sticky-Bit (1). Auf einem Verzeichnis bewirkt SGID, dass die Gruppe weitervererbt wird. Unterverzeichnisse erben zusätzlich das SGID-Bit, damit die Wirkung im ganzen Baum erhalten bleibt. Typischer Einsatz sind gemeinsame Projektverzeichnisse.

### Aufgabe 20

a)

| Zeitpunkt | symbolisch   | oktal |
|-----------|--------------|-------|
| vorher    | `drwxrwx---` | 770   |
| nachher   | `drwxrws---` | 2770  |

b) Das SGID-Bit wird an der Stelle des Gruppen-`x` angezeigt. Weil dort vorher ein `x` gesetzt war, erscheint ein kleines `s`.

> **Hintergrund:** Die führende Ziffer 2 in der oktalen Schreibweise steht für SGID. Wäre für die Gruppe kein `x` gesetzt, würde ein großes `S` erscheinen (SGID ohne Ausführungsrecht).

### Aufgabe 21

a)

| Eintrag     | Besitzer | Gruppe  | Rechte (symbolisch) |
|-------------|----------|---------|---------------------|
| neu.txt     | ben      | projekt | `rw-r--r--`         |
| unterordner | ben      | projekt | `rwxr-sr-x`         |
| konzept.txt | anna     | anna    | `rw-r--r--`         |

b) Das SGID-Bit wirkt nur auf Einträge, die nach dem Setzen angelegt werden. Vorhandene Dateien bleiben unverändert (nicht rückwirkend).

c) `sudo chgrp projekt /srv/projekt/doku/konzept.txt` (`sudo`, weil tim nicht Besitzer ist).

> **Hintergrund:** `neu.txt`: 666 − 022 = 644. Der Ordner: 777 − 022 = 755, dazu kommt das geerbte SGID-Bit, daher `rwxr-sr-x`. Der Besitzer ist immer der Ersteller, SGID betrifft nur die Gruppe.

## Teil 7: Zugriff analysieren

### Aufgabe 22

| Aktion                                       | anna | ben | carla | tim  |
|----------------------------------------------|------|-----|-------|------|
| a) Inhalt von `/srv/projekt/doku` auflisten  | ja   | ja  | nein  | ja   |
| b) in `/srv/projekt/code/build` wechseln     | ja   | ja  | nein  | ja   |
| c) in `/srv/projekt/code/build` eine Datei anlegen | nein | ja | nein | nein |
| d) Inhalt von `/srv/projekt/austausch` auflisten | ja | ja | nein | nein |
| e) `konzept.txt` nach `austausch` kopieren   | ja   | ja  | nein  | nein |

**Begründungen:**

- **carla (a):** `/srv/projekt` hat für others `---`, ohne `x` darauf kommt sie nicht zu `doku`.
- **tim (d):** `austausch` gehört `anna:extern` mit 770. tim ist weder Besitzer noch in `extern`, für ihn gilt others `---`.
- **anna (c):** `build` gehört `ben:projekt` mit 755. Für anna gilt die Gruppe `projekt` mit `r-x`, es fehlt `w` zum Anlegen.

> **Hintergrund:** Zeile e): Zum Kopieren braucht man `r` auf der Quelldatei, `x` auf dem ganzen Weg dorthin sowie `w` und `x` im Zielverzeichnis. tim kann `konzept.txt` lesen (others `r--`), scheitert aber am Ziel `austausch`. Wechseln braucht `x`, Auflisten `r`, Anlegen `w` und `x` im Verzeichnis. Dazu kommt immer das `x` auf allen übergeordneten Verzeichnissen.

### Aufgabe 23

1. **Richtig:** ben kann in `/srv/projekt/doku` Dateien anlegen. Die Gruppe `projekt` hat `rwx` (2770), ben ist Mitglied, der Weg ist frei (`r-x` auf `/srv/projekt`).
2. **Richtig:** carla kann `/srv/projekt/austausch` nicht auflisten. Ihr fehlt `x` auf `/srv/projekt`. Die Mitgliedschaft in `extern` nützt nichts, wenn der Weg versperrt ist.
3. **Richtig:** tim kann in `/srv/projekt/code/build` wechseln. Als Mitglied von `projekt` hat er dort `r-x` (755), und `x` genügt zum Wechseln.
4. **Richtig:** anna kann in `/srv/projekt/code/build` keine Dateien anlegen. Die Gruppe `projekt` hat dort nur `r-x`, es fehlt `w`.

> **Hintergrund:** Bei Aussagen mit Verneinung zuerst festhalten, was genau behauptet wird („kann" oder „kann nicht"), und erst dann prüfen. „Kann keine Dateien anlegen" bedeutet: `w` oder `x` fehlt irgendwo im Weg oder im Zielverzeichnis.

### Aufgabe 24

a) carla fällt bei `/srv/projekt` (`root:projekt`, 750) in die Klasse others mit `---`. Ohne `x` auf einem Verzeichnis im Pfad erreicht sie `austausch` nicht, auch wenn sie dort als Mitglied von `extern` `rwx` hätte.

b) Als Mitglied von `projekt` hätte carla Zugriff auf `doku` und `code`, also auf alle Projektdaten. Das ist viel mehr als nötig und widerspricht dem Prinzip der minimalen Rechte.

c) `sudo chmod o+x /srv/projekt` (gleichwertig `sudo chmod 751 /srv/projekt`)

d) Zustand nach dem Befehl:

| Aktion                                  | ja/nein | Begründung                                                              |
|-----------------------------------------|---------|-------------------------------------------------------------------------|
| (1) `/srv/projekt/austausch` auflisten  | ja      | `x` für others auf `/srv/projekt`, auf `austausch` hat `extern` (carla) `rwx` |
| (2) `/srv/projekt` auflisten            | nein    | others haben nur `--x`, kein `r`                                        |
| (3) in `/srv/projekt/doku` wechseln     | nein    | others haben auf `doku` `---`                                           |
| (4) in `/srv/projekt/code` wechseln     | nein    | others haben auf `code` `---`                                           |

> **Hintergrund:** `x` ohne `r` auf einem Verzeichnis bedeutet: durchqueren erlaubt, auflisten nicht. Die Änderung ist die sparsamste Lösung, weil sie nur an einer Stelle ein einziges Recht ergänzt und kein Projektverzeichnis öffnet. Danach gilt `/srv/projekt` mit `drwxr-x--x` (751) als neue Ausgangslage.

### Aufgabe 25

1. **Klasse bestimmen:** Für jedes Verzeichnis und jede Datei im Pfad prüfen, ob die Person Besitzer ist, sonst Mitglied der Gruppe (Primärgruppe oder weitere), sonst others. Der erste Treffer gilt.
2. **Rechte der Klasse mit dem Bedarf vergleichen:** Wechseln braucht `x`, Auflisten `r`, Lesen einer Datei `r`, Anlegen und Löschen `w` und `x` im Verzeichnis. Kopieren braucht `r` an der Quelle und `w` und `x` am Ziel.
3. **Den ganzen Pfad prüfen:** `x` muss auf jedem übergeordneten Verzeichnis ab `/` vorhanden sein. Eine einzige fehlende Stelle genügt, damit der Zugriff scheitert.

> **Hintergrund:** Bei einem Zugriffsproblem hilft `ls -ld` für jeden Teil des Pfades. Die sparsame Lösung ändert genau die Stelle, an der etwas fehlt (Gruppe, Besitzer oder ein einzelnes Recht), und nicht pauschal `777` oder `o+rwx`.

---

## Abdeckung der Kannliste

| Kannliste-Punkt                                                     | Aufgabe              |
|---------------------------------------------------------------------|----------------------|
| **Anmelden und Orientieren**                                        |                      |
| per `ssh benutzer@rechner` einloggen                                | 1b                   |
| mit `ping` Erreichbarkeit und Namensauflösung prüfen                | 1a                   |
| Terminalausgabe lesen und Informationen ableiten                    | 1a, 5, 9             |
| Prompt lesen und bei Pfadwechsel anpassen                           | 1c, 10b              |
| `man` und `--help` nutzen                                           | 1d, 1e               |
| **Benutzer und Gruppen**                                            |                      |
| `id` und `id benutzer` auslesen                                     | 2                    |
| Primärgruppe und weitere Gruppen unterscheiden                      | 2d                   |
| Benutzer zu Gruppe hinzufügen (`adduser`, `usermod -aG`)            | 3a, 4a, 4b           |
| erklären, warum man sich neu einloggen muss                         | 3c                   |
| Benutzer- und Gruppenlisten auswerten                               | 2e, 22               |
| wann `sudo` nötig ist, warum nicht unnötig                          | 3b, 4c, 16, 18       |
| **Rechte lesen**                                                    |                      |
| `ls -l` / `ls -la` vollständig lesen                                | 5                    |
| `r`, `w`, `x` bei Dateien und Verzeichnissen unterscheiden          | 6                    |
| symbolisch und oktal umrechnen                                      | 7                    |
| bestimmen, welche Rechtegruppe für eine Person gilt                 | 8                    |
| Verzeichnisbaum lesen und fehlende Angaben ergänzen                 | 9                    |
| **Rechte und Eigentümer ändern**                                    |                      |
| `chmod` oktal                                                       | 14                   |
| `chmod` symbolisch (`g+s`, `o-rwx`, `u=rwx`)                        | 15, 19c, 24c         |
| `chown besitzer:gruppe`, `chown :gruppe`                            | 17c, 18              |
| `chgrp`                                                             | 16, 17b              |
| entscheiden, welche Änderung nötig ist                              | 16                   |
| begründen, warum Rechte für others vermieden werden                 | 17d, 24b             |
| Reihenfolge von `chmod` und `chown`, `sudo` dafür                   | 18                   |
| **SGID-Bit**                                                        |                      |
| Wirkung erklären                                                    | 19b                  |
| SGID setzen                                                         | 19c                  |
| Rechte oktal (`2770`) und symbolisch (`rwxrws---`) angeben          | 20a                  |
| erklären, warum `s` statt `x` erscheint                             | 20b                  |
| erklären, dass SGID nicht rückwirkend wirkt                         | 21b, 21c             |
| begründen, wer SGID setzen darf                                     | 19d                  |
| **Dateien und Verzeichnisse verwalten**                             |                      |
| `cd` mit absoluten und relativen Pfaden                             | 10                   |
| `.`, `..`, `~` einsetzen                                            | 10e, 10f             |
| `mkdir` mit relativem Pfad                                          | 11a                  |
| `ls -l` für ein Verzeichnis ohne Wechsel                            | 11c                  |
| Rechte und Gruppe neuer Dateien vorhersagen (umask, SGID)           | 12, 21               |
| `mv`, `cp`, `rm`                                                    | 13                   |
| `cp` mit `rm` gleich `mv`, Unterschied erklären                     | 13c, 13d             |
| **Zugriff analysieren**                                             |                      |
| den gesamten Pfad prüfen                                            | 22, 24, 25           |
| wechseln, auflisten, anlegen, kopieren                              | 22a–e                |
| Aussagen mit Verneinung auswerten                                   | 23                   |
| Änderungen als neue Ausgangslage berücksichtigen                    | 24d                  |
| Fehlersituation analysieren, sparsame Lösung vorschlagen            | 17, 24               |
