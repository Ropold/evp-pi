#!/usr/bin/env bash
#
# setup_rechte_uebung.sh
#
# Richtet die Grobstruktur der Linux-Rechte-Übung "Berechtigungen unter
# Linux" auf einem frischen Debian-/Raspberry-Pi-OS-System ein (z. B. den
# Raspberry Pi der Schüler oder eine Testumgebung), damit das Szenario aus
# dem Übungsdiagramm real nachgestellt werden kann.
#
# WICHTIG: Dieses Skript legt NUR das Ausgangsszenario an. Die Gruppe
# "tools" und der Nutzer "hklaus" sowie /srv/projekte sind bewusst NICHT
# enthalten - die Schüler sollen genau das in den Vorbereitungsaufgaben
# V1-V3 der Übung selbst herstellen. Würde das Skript das schon erledigen,
# wären V1-V3 trivial/sinnlos.
#
# Ausführen als root (bzw. mit sudo):
#   sudo bash setup_rechte_uebung.sh
#
# Mehrfaches Ausführen ist unschädlich (idempotent) - bereits vorhandene
# Nutzer/Gruppen werden übersprungen, Verzeichnisrechte aber jedes Mal neu
# gesetzt, falls sie versehentlich verändert wurden.

set -euo pipefail

if [[ $EUID -ne 0 ]]; then
    echo "Bitte als root ausführen (sudo bash $0)." >&2
    exit 1
fi

# ---------------------------------------------------------------------------
# Konfiguration
# ---------------------------------------------------------------------------
# Startpasswort für alle angelegten Accounts (zum Login per SSH). Für den
# echten Klausureinsatz ggf. anpassen oder nach dem Skriptlauf individuell
# ändern lassen (passwd <user>).
DEFAULT_PASSWORD="${DEFAULT_PASSWORD:-asdf}"

GID_TECHNIK=2010
GID_MKELLER=2001
GID_BWAGNER=2002
# GID 2011 ("tools") wird NICHT als Gruppe angelegt, sondern nur numerisch
# auf /srv/tools vorbelegt - genau das sollen die Schüler in V1 auflösen.
GID_TOOLS_PLACEHOLDER=2011

# ---------------------------------------------------------------------------
# Hilfsfunktionen
# ---------------------------------------------------------------------------
log() { echo "==> $*"; }

ensure_group() {
    local name="$1" gid="$2"
    if getent group "$name" >/dev/null; then
        local cur_gid
        cur_gid="$(getent group "$name" | cut -d: -f3)"
        if [[ "$cur_gid" != "$gid" ]]; then
            echo "WARNUNG: Gruppe '$name' existiert bereits mit GID $cur_gid (erwartet: $gid)." >&2
        else
            log "Gruppe '$name' (GID $gid) existiert bereits."
        fi
    else
        addgroup --gid "$gid" "$name"
        log "Gruppe '$name' (GID $gid) angelegt."
    fi
}

ensure_user() {
    # ensure_user <name> <primaer-gid> <zusatzgruppen...>
    local name="$1" gid="$2"
    shift 2
    local extra_groups=("$@")

    if id "$name" &>/dev/null; then
        log "Nutzer '$name' existiert bereits, überspringe Anlage."
    else
        adduser --disabled-password --gecos "" --gid "$gid" "$name"
        echo "${name}:${DEFAULT_PASSWORD}" | chpasswd
        log "Nutzer '$name' angelegt (primäre Gruppe GID $gid, Passwort '$DEFAULT_PASSWORD')."
    fi

    for g in "${extra_groups[@]}"; do
        adduser "$name" "$g" >/dev/null
    done
    if [[ ${#extra_groups[@]} -gt 0 ]]; then
        log "Nutzer '$name' ist Mitglied von: ${extra_groups[*]}."
    fi

    chmod 755 "/home/${name}"
}

# ---------------------------------------------------------------------------
# 1) Gruppe technik (Admin-/Technik-Team)
# ---------------------------------------------------------------------------
ensure_group technik "$GID_TECHNIK"

# ---------------------------------------------------------------------------
# 2) Hauptnutzer des Szenarios
#    - mkeller: eigene Gruppe (GID 2001), Mitglied in technik + sudo
#    - bwagner: eigene Gruppe (GID 2002), Mitglied in technik, NICHT in sudo
# ---------------------------------------------------------------------------
ensure_group mkeller "$GID_MKELLER"
ensure_user  mkeller "$GID_MKELLER" technik sudo

ensure_group bwagner "$GID_BWAGNER"
ensure_user  bwagner "$GID_BWAGNER" technik

# ---------------------------------------------------------------------------
# 3) Weitere sudo-Mitglieder aus dem /etc/group-Auszug der Übung.
#    Diese Accounts haben in der Übung selbst keine aktive Rolle, sollen
#    aber existieren, damit "cat /etc/group" exakt dem Arbeitsblatt
#    entspricht, falls Schüler das real nachprüfen.
# ---------------------------------------------------------------------------
for extra_user in zturner fweber; do
    if id "$extra_user" &>/dev/null; then
        log "Nutzer '$extra_user' existiert bereits, überspringe Anlage."
    else
        adduser --disabled-password --gecos "" "$extra_user"
        echo "${extra_user}:${DEFAULT_PASSWORD}" | chpasswd
        adduser "$extra_user" sudo >/dev/null
        log "Nutzer '$extra_user' angelegt und zu sudo hinzugefügt."
    fi
done

# Achtung: hklaus wird hier bewusst NICHT angelegt (siehe Kopfkommentar).

# ---------------------------------------------------------------------------
# 4) Verzeichnisstruktur gemäß Diagramm
# ---------------------------------------------------------------------------

# /home: root:technik, rwxr-xr-x
chgrp technik /home
chmod 755 /home
log "/home -> root:technik, 755"

# /srv: root:technik, rwxr--r-- (Gruppe technik bewusst OHNE x-Recht)
mkdir -p /srv
chown root:technik /srv
chmod 754 /srv
log "/srv -> root:technik, 754"

# /srv/tools: existiert schon, aber die Gruppe "tools" (GID 2011) gibt es
# noch nicht - deshalb hier nur numerisch vorbelegt. Erst wenn ein Schüler
# in V1 "addgroup --gid 2011 tools" ausführt, löst ls -l die GID zum Namen
# "tools" auf.
mkdir -p /srv/tools
chown root:"$GID_TOOLS_PLACEHOLDER" /srv/tools
chmod 755 /srv/tools
log "/srv/tools -> root:$GID_TOOLS_PLACEHOLDER (numerisch, Gruppe 'tools' existiert absichtlich noch nicht), 755"

# /srv/projekte wird NICHT angelegt - das ist Teil von V3.

# ---------------------------------------------------------------------------
# 5) Verifikation
# ---------------------------------------------------------------------------
echo
echo "=== Verifikation ==="
echo "--- Gruppen ---"
getent group technik mkeller bwagner | sort -t: -k3 -n
echo
echo "--- /etc/group-Zeile sudo ---"
getent group sudo
echo
echo "--- Verzeichnisrechte ---"
ls -ld /home /home/mkeller /home/bwagner /srv /srv/tools
echo
echo "Grundszenario eingerichtet. Gruppe 'tools', Nutzer 'hklaus' und"
echo "/srv/projekte legen die Schüler in den Vorbereitungsaufgaben V1-V3 an."
