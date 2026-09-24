# Fortbildungsplattform – Klick-Mockup „Bedarfserhebung“

Klickbares Mockup auf Basis des Design-Dokuments `design/Fortbildung UX.dc.html`
(Screens 2a–e, 2g, 2h · 3a–e · 4a–g). Es zeigt, wie die Anwendung aussieht und bedient wird –
es werden **keine Daten gespeichert**; nach „Neu starten“ oder Neuladen ist alles zurückgesetzt.

## Öffnen

Statische Dateien, kein Build nötig. Wegen der iFrames am besten über einen kleinen Webserver:

```bash
python3 -m http.server 8000
# dann http://localhost:8000 öffnen
```

(Oder über GitHub Pages: Settings → Pages → Branch wählen.)

## Aufbau

| Datei | Inhalt |
| --- | --- |
| `index.html` | Vergleichsansicht: Desktop und Mobile nebeneinander, Umschalter **Beide / Desktop / Mobile**, „Neu starten“ je Gerät. Über jedem Gerät steht, welcher Screen aus dem Design-Dokument gerade zu sehen ist (Link springt dorthin). |
| `app.html?device=desktop` / `app.html?device=mobile` | Die eigentliche App, einzeln aufrufbar. |
| `js/app.js`, `css/app.css` | Logik und Styles der App. |
| `design/` | Das originale Design-Dokument inkl. aller Beispiele und Skizzen (unverändert). |

## Abläufe

**Startseite** (2g) – auf Desktop neu gestaltet: drei Kacheln *Bedarf melden*, *Bedarfe entdecken*, *Angebote abgeben*. Das Haus-Icon führt überall hierher zurück.

**Bedarf melden**
- Desktop: Eingabe links mit Umschalter Einfach/Detailliert (3a/3b), rechts die einklappbare Einordnung (3d zeigt die Zahl offener Felder). „Zur Liste hinzufügen“ mit fehlenden Angaben öffnet die Einordnung und markiert die Felder (3e). Danach Liste „Meine Fortbildungswünsche“ (3c): auswählen, bearbeiten, löschen, einreichen.
- Mobile: vier Schritte Beschreiben → Einordnen → Prüfen → Einreichen (2a–2e).
- „Beispiele“ öffnet die Beispiel-Box (2h); jedes Beispiel lässt sich übernehmen.

**Bedarfe entdecken** (4a/4b/4c): Suche, Filter (Niveau, Fach, Jahrgangsstufe, Themenbereich, „nur gefällt mir“), Sortierung, „Gefällt mir“, „Mehr anzeigen“. Mobile öffnet die Filter als Floating-Box.

**Angebot abgeben** (4d/4e/4f/4g): initiativ oder als Antwort auf einen Bedarf; nach dem Einreichen „Meine Angebote“ mit Reitern. Auf Mobile ergänzt: Schritt 3 „Prüfen“ und eine mobile Angebotsliste.
