# Divisioner är kort på nivåsidan, inte egna sidor

Ersätter ADR 0004. Varje division har inte längre en egen sida (`/rod/division-5/`). Nästan all information ligger i nivåsidans blad (ADR 0005), så en separat sida per division upprepade mest samma fakta.

- **Divisionsrutorna** högst upp på nivåsidan är ankarlänkar (`#division-5`) till varsitt kort längre ned, i avsnittet "Divisionsanpassningar".
- **Varje division har ett kort**, även en division utan avvikelser. Kortet anger bara vad divisionen skiljer sig i från nivån (en divisionsanpassning enligt ADR 0002), eller "Inga avvikelser från {nivå}".
- **Gemensamma fakta lagras fortfarande en gång** i nivåguiden. Divisionens avvikelser ligger i `divisionsanpassningar`, som förut.
- **Gamla adresser** (`/rod/division-5/` m.fl.) skickas vidare till kortet (`/rod/#division-5`) via `redirects` i `astro.config.mjs`. Listan över dem hör till säsongens divisioner och behöver uppdateras om en nivå får en ny division.
- Division utan verifierade uppgifter får inget eget varningskort längre; nivåsidans notis om overifierade divisioner (ADR 0002) gäller.
