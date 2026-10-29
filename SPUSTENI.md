# Spuštění statické verze

Aktuální příkazy jsou v [README](README.md). Nastavení účtů a Cloudflare Pages popisuje [návod pro Martina](docs/OWNER-SETUP.md).

Web už nemá vlastní administraci, API, Worker ani databázi. Původní postup pro D1, SQLite a FormSubmit byl vyřazen. Používá se Web3Forms s povinným ověřením hCaptcha u poskytovatele; před jeho ověřením je webové odesílání vypnuté.
