# LLM Prompt: Update `index.md` Architecture Overview

**Role:**  
You are an experienced full-stack architect and technical writer. Your task is to **rewrite and update `index.md`** to reflect the current target architecture of the OZE-Platforma-EduBad project.

---

## 1. Input

You are given an existing `index.md` file (MDX-compatible). It currently:

- Describes an early MVP with:
  - bezpośrednimi URL-ami do usług,
  - port-based access do Node-RED / Grafana,
  - uproszczoną strukturą bez API Gateway i dedykowanego frontendu.
- Nie odzwierciedla:
  - podziału na oficjalną stronę `oze.zut.edu.pl` (Next.js),
  - architektury opartej o kontenery: InfluxDB, Node-RED, Grafana, API Gateway, React frontend na VPS.

You must produce a **complete, updated version** of `index.md` that replaces the old content.

---

## 2. Current Architecture (Ground Truth)

Use the following as canonical:

### 2.1. Warstwa oficjalna – `oze.zut.edu.pl` (Landing/Label)

- Publiczna, oficjalna strona Katedry i projektu.
- Zaimplementowana w **Next.js** jako statyczny serwis (eksportowany na infrastrukturę Apache/PHP uczelni).
- Hostowana na współdzielonym serwerze uczelni (Apache/PHP).
- Rola:
  - prezentacja katedry,
  - informacje o projekcie,
  - link do interaktywnej platformy badawczo-edukacyjnej na VPS (np. `platform.oze.zut.edu.pl`).

### 2.2. Warstwa platformy – VPS (OZE-Platforma-EduBad)

- Uruchomiona na VPS (Docker / Docker Compose).
- Kontenery:

  - `influxdb` → baza pomiarowa (time-series).
  - `nodered` → integracja źródeł danych, przepływy, symulacje, przetwarzanie.
  - `grafana` → wizualizacja danych, dashboardy interaktywne.
  - `api-gateway` (Express/Node.js) → spójne API dla frontendu, warstwa bezpieczeństwa i integracji nad usługami danych.
  - `frontend` (React app) → główny interfejs webowy platformy:
    - korzysta z API Gateway,
    - może integrować/embeddować Grafanę,
    - jest głównym punktem wejścia do funkcji edukacyjno-badawczych.

- Dane:
  - aktualnie **symulowane/syntetyczne**, zgodne ze scenariuszami edukacyjnymi i R&D,
  - architektura przygotowana na późniejszą integrację z realnymi urządzeniami i zasobami laboratoryjnymi.

---

## 3. Zasady edycji `index.md`

Podczas aktualizacji:

1. **Zachowaj istniejącą strukturę MDX tam, gdzie to ma sens**

   - Zachowaj importy na górze pliku, np.:

     ```ts
     import { getWebApps, getGitHubRepos, getDeployedServices } from '@site/src/data/links';
     ```

   - Zachowaj sekcje, które renderują dynamiczne listy:
     - Web Applications
     - GitHub Repositories
     - Deployed Services

   - Nie zmieniaj nazw importowanych funkcji ani ich użycia.
   - Załóż, że ich implementacja (URL-e, listy) zostanie zaktualizowana osobno.

2. **Zaktualizuj nagłówek i wstęp**

   - Ustaw wyraźny nagłówek, np.:

     ```md
     # Version: V1.1.0 – Next.js Landing & VPS Platform Architecture
     ```

   - Pod nim krótki akapit, który jasno stwierdza:

     - `oze.zut.edu.pl` → Next.js-based official landing page na hostingu ZUT.
     - VPS → konteneryzowana OZE-Platforma-EduBad:
       - InfluxDB, Node-RED, Grafana,
       - API Gateway (Express),
       - React frontend.

3. **Usuń lub przeredaguj nieaktualne fragmenty**

   - Usuń/przepisz fragmenty opisujące:
     - bezpośredni dostęp do usług po portach,
     - brak reverse proxy / brak warstwy API,
     - uproszczone MVP, które omija frontend i gateway.
   - Zastąp je opisem:
     - separacji landing page vs. platforma,
     - centralnej roli API Gateway,
     - React frontend jako głównego interfejsu użytkownika.

4. **Zaktualizuj sekcję „Main Components”**

   Utwórz tabelę lub listę opisującą kluczowe komponenty:

   - **Next.js Landing Page (`oze.zut.edu.pl`)** – statyczna strona oficjalna, informacyjna, link do platformy.
   - **React Frontend (Platform UI)** – interfejs użytkownika na VPS, korzystający z API Gateway i wizualizacji.
   - **API Gateway (Express/Node.js)** – spójne API, kontrola dostępu, maskowanie wewnętrznych usług.
   - **Node-RED** – integracja źródeł danych, scenariusze dydaktyczne, przetwarzanie, symulacje.
   - **InfluxDB** – magazyn danych pomiarowych (time-series).
   - **Grafana** – dashboardy i wizualizacja danych (publiczne/edukacyjne i eksperymentalne widoki).
   - **Docker / Docker Compose** – orkiestracja całego środowiska na VPS.

5. **Zdefiniuj klarowny „Data & Request Flow”**

   Dodaj sekcję opisującą przepływ:

   1. Urządzenia symulowane / źródła danych / scenariusze dydaktyczne → **Node-RED**.
   2. Node-RED przetwarza dane i zapisuje je do **InfluxDB**.
   3. **Grafana** odczytuje dane z InfluxDB i udostępnia dashboardy.
   4. **API Gateway**:
      - wystawia wybrane endpointy do odczytu danych, metadanych, scenariuszy,
      - integruje się z Node-RED / InfluxDB / innymi usługami.
   5. **React frontend** korzysta wyłącznie z API Gateway i skonfigurowanych zasobów (np. embed Grafana).
   6. Użytkownicy:
      - zaczynają na `oze.zut.edu.pl` (Next.js landing),
      - przechodzą do platformy na VPS, gdzie korzystają z interaktywnych narzędzi.

6. **Zaktualizuj diagramy architektury**

   - Zastąp stare diagramy prostymi, aktualnymi schematami ASCII lub tekstowymi.
   - Pokaż:

     - `oze.zut.edu.pl` (Next.js) → jako oficjalna strona.
     - Subdomena/platforma na VPS → reverse proxy / frontend / API gateway / Node-RED / InfluxDB / Grafana.
     - Klarowny podział: „Landing (ZUT hosting)” vs „Platforma (VPS, Docker)”.

7. **Zaktualizuj „Key Features”**

   Wypunktuj cechy, które są **prawdziwe dla nowej architektury**:

   - Separacja:
     - oficjalna strona informacyjna (Next.js, `oze.zut.edu.pl`),
     - dedykowana platforma badawczo-edukacyjna na VPS.
   - Spójne API:
     - API Gateway jako centralny punkt integracji i bezpieczeństwa.
   - Modułowość:
     - każdy komponent w kontenerze,
     - możliwość łatwego dodania nowych usług (np. MQTT broker, kolejne mikroserwisy).
   - Edukacyjno-badawcze przeznaczenie:
     - dane symulowane,
     - środowisko dla studentów i zespołu badawczego.
   - Gotowość na:
     - realne dane pomiarowe,
     - integracje z laboratoriami i zewnętrznymi źródłami.

8. **Styl i jakość**

   - Styl: rzeczowy, techniczny, klarowny.
   - Bez „marketing talk”.
   - Pisz tak, aby:
     - student, współpracownik albo recenzent projektu
     - mógł szybko zrozumieć aktualny stan architektury.

---

## 4. Output

Na wyjściu wygeneruj:

- **Kompletną, gotową do użycia treść `index.md` (MDX)**,
- Zawierającą:
  - zaktualizowany nagłówek z wersją,
  - poprawione sekcje architektury, komponentów, przepływu danych, cech,
  - aktualne diagramy,
  - zachowane importy i dynamiczne listy.

Nie zwracaj tylko diffów ani komentarzy – zwróć pełny, finalny plik `index.md`, gotowy do podmiany.
