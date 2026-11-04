# Ordnerstruktur – EVP-PI (Plan)

Geplante Struktur für die Linux-Übungskonsole, im Stil von `Ordnerstruktur.md`.
Nur Ordner und Dateinamen, noch ohne Inhalt.
Nicht enthalten sind generierte bzw. ignorierte Ordner wie `node_modules/`, `target/`, `dist/` und `.idea/`.

## Überblick

| Ordner | Inhalt |
|---|---|
| `.github/workflows/` | CI/CD: Maven-Build, Deployment |
| `backend/` | Spring-Boot-Backend (Java, Maven), liefert nur das Frontend aus |
| `backend/src/main/resources/docs/` | Projektdokumentation, Kannliste, Pläne |
| `frontend/` | React-Frontend (TypeScript, Vite) |
| `frontend/src/components/` | Komponenten je Bereich (practice, task, terminal) sowie Models, Styles, Utils |
| `frontend/src/components/utils/commands/` | Ein Modul pro simuliertem Linux-Befehl |
| `frontend/src/components/utils/filesystem/` | Virtuelles Dateisystem, Benutzer, Gruppen, Rechteprüfung |
| `frontend/src/data/` | Aufgaben als JSON (nur Inhalt, wird nie verändert) |

## Struktur

```
evp-pi/
├── .github/
│   └── workflows/
│       ├── deploy.yml
│       └── maven.yml
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── ropold/
│   │   │   │       └── backend/
│   │   │   │           └── BackendApplication.java
│   │   │   └── resources/
│   │   │       ├── docs/
│   │   │       │   ├── Anweisung.md
│   │   │       │   ├── Kannliste_Linux_Rechteverwaltung.md
│   │   │       │   ├── Kannliste_Linux_Rechteverwaltung.pdf
│   │   │       │   ├── Ordnerstruktur.md
│   │   │       │   ├── Ordnerstruktur_Plan.md
│   │   │       │   └── promt.md
│   │   │       ├── static/
│   │   │       └── application.yaml
│   │   └── test/
│   │       └── java/
│   │           └── ropold/
│   │               └── backend/
│   │                   └── BackendApplicationTests.java
│   └── pom.xml
├── frontend/
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── practice/
│   │   │   │   ├── ExamResult.tsx
│   │   │   │   ├── Exam.tsx
│   │   │   │   ├── Practice.tsx
│   │   │   │   ├── PracticeFilter.tsx
│   │   │   │   └── ProgressOverview.tsx
│   │   │   ├── task/
│   │   │   │   ├── TaskAnswerInput.tsx
│   │   │   │   ├── TaskButtons.tsx
│   │   │   │   ├── TaskFormattedText.tsx
│   │   │   │   ├── TaskHint.tsx
│   │   │   │   ├── TaskPanel.tsx
│   │   │   │   ├── TaskRating.tsx
│   │   │   │   ├── TaskSession.tsx
│   │   │   │   ├── TaskSolution.tsx
│   │   │   │   └── TaskSuccess.tsx
│   │   │   ├── terminal/
│   │   │   │   ├── Terminal.tsx
│   │   │   │   └── TerminalFreeMode.tsx
│   │   │   ├── models/
│   │   │   │   ├── CommandResultModel.ts
│   │   │   │   ├── FileSystemNodeModel.ts
│   │   │   │   ├── GroupModel.ts
│   │   │   │   ├── ProgressModel.ts
│   │   │   │   ├── Rating.ts
│   │   │   │   ├── ShellStateModel.ts
│   │   │   │   ├── TaskCategory.ts
│   │   │   │   ├── TaskCheckModel.ts
│   │   │   │   ├── TaskModel.ts
│   │   │   │   ├── TaskType.ts
│   │   │   │   └── UserModel.ts
│   │   │   ├── styles/
│   │   │   │   ├── practice/
│   │   │   │   │   └── Practice.css
│   │   │   │   ├── task/
│   │   │   │   │   └── TaskPanel.css
│   │   │   │   ├── terminal/
│   │   │   │   │   └── Terminal.css
│   │   │   │   ├── Buttons.css
│   │   │   │   ├── Navbar.css
│   │   │   │   └── Welcome.css
│   │   │   ├── utils/
│   │   │   │   ├── commands/
│   │   │   │   │   ├── AdduserCommand.ts
│   │   │   │   │   ├── CatCommand.ts
│   │   │   │   │   ├── CdCommand.ts
│   │   │   │   │   ├── ChgrpCommand.ts
│   │   │   │   │   ├── ChmodCommand.ts
│   │   │   │   │   ├── ChownCommand.ts
│   │   │   │   │   ├── ClearCommand.ts
│   │   │   │   │   ├── CommandHelpers.ts
│   │   │   │   │   ├── CommandRegistry.ts
│   │   │   │   │   ├── CpCommand.ts
│   │   │   │   │   ├── EchoCommand.ts
│   │   │   │   │   ├── ExitCommand.ts
│   │   │   │   │   ├── GroupsCommand.ts
│   │   │   │   │   ├── HelpCommand.ts
│   │   │   │   │   ├── HelpTexts.ts
│   │   │   │   │   ├── HostnameCommand.ts
│   │   │   │   │   ├── IdCommand.ts
│   │   │   │   │   ├── LsCommand.ts
│   │   │   │   │   ├── ManCommand.ts
│   │   │   │   │   ├── MkdirCommand.ts
│   │   │   │   │   ├── MvCommand.ts
│   │   │   │   │   ├── PingCommand.ts
│   │   │   │   │   ├── PwdCommand.ts
│   │   │   │   │   ├── RmCommand.ts
│   │   │   │   │   ├── RmdirCommand.ts
│   │   │   │   │   ├── SshCommand.ts
│   │   │   │   │   ├── SuCommand.ts
│   │   │   │   │   ├── SudoCommand.ts
│   │   │   │   │   ├── TouchCommand.ts
│   │   │   │   │   ├── UmaskCommand.ts
│   │   │   │   │   ├── UsermodCommand.ts
│   │   │   │   │   └── WhoamiCommand.ts
│   │   │   │   ├── filesystem/
│   │   │   │   │   ├── FileSystemFactory.ts
│   │   │   │   │   ├── PathResolver.ts
│   │   │   │   │   ├── PermissionCheck.ts
│   │   │   │   │   ├── PermissionConverter.ts
│   │   │   │   │   └── VirtualFileSystem.ts
│   │   │   │   ├── CommandParser.ts
│   │   │   │   ├── ProgressStorage.ts
│   │   │   │   ├── RepetitionScheduler.ts
│   │   │   │   ├── SessionManager.ts
│   │   │   │   ├── TabCompletion.ts
│   │   │   │   ├── TaskChecker.ts
│   │   │   │   └── TaskFilters.ts
│   │   │   ├── Footer.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── NotFound.tsx
│   │   │   └── Welcome.tsx
│   │   ├── data/
│   │   │   └── tasks.json
│   │   ├── App.css
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── eslint.config.js
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
├── .gitignore
└── Dockerfile
```

## Wofür die Bereiche da sind

| Bereich | Aufgabe |
|---|---|
| `practice/` | Seiten: Lernmodus, Prüfungsmodus, Filter (Neu/Schwer/Mittel/Leicht/Alle), Fortschritt |
| `task/` | Aufgabe oben: Text, Buttons, Tipp, Lösung, Antwortfeld, Bewertung, Erfolgsmeldung |
| `terminal/` | xterm.js-Konsole; `TerminalFreeMode` zum freien Üben ohne Aufgabe |
| `models/` | Typen: Aufgabe, Dateisystem-Knoten, Benutzer, Gruppe, Fortschritt, Enums (`Rating`, `TaskType`, `TaskCategory`) |
| `utils/commands/` | Ein Befehl pro Datei; `CommandRegistry` ordnet Namen zu, unbekannte → `command not found` |
| `utils/filesystem/` | Dateisystem-Baum, Pfade (`.`, `..`, `~`), Rechteprüfung, Oktal ↔ symbolisch |
| `utils/` | Eingabe zerlegen, Zustand gegen Aufgabe prüfen, Fortschritt in `localStorage`, Wiederholungsplan, Filter |
| `data/` | `tasks.json` mit allen Aufgaben |

## Unterschiede zur Vorlage

- Kein `dto/`-Ordner im Frontend, weil es keine API gibt.
- Neuer Ordner `data/` für die Aufgaben-JSON.
- `utils/` hat Unterordner (`commands/`, `filesystem/`), weil es sonst über 30 Dateien in einem Ordner wären.
- Backend bleibt minimal: keine Controller, Services oder Repositories, solange es keine Datenbank gibt.
- Kein `assets/`-Ordner, solange es keine Bilder gibt.
- Bei der Umsetzung dazugekommen:
  - `task/TaskSession.tsx`: eine Aufgabe samt Terminal, genutzt von Üben und Prüfung
  - `task/TaskFormattedText.tsx`: zeigt `code` und **fett** aus den Aufgabentexten an
  - `utils/SessionManager.ts`: Sitzungen für `ssh`, `su`, `exit` und bekannte Rechner für `ping`
  - `utils/TabCompletion.ts`: Tab-Vervollständigung für Befehle und Pfade
  - `utils/commands/CommandHelpers.ts`: gemeinsame Hilfen (Anlegen mit umask/SGID, Sticky-Bit)
  - weitere Befehle: `exit`/`logout`, `groups`, `help`, `hostname`, `rmdir`
