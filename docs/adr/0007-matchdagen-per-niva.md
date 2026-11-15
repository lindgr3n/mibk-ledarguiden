# Matchdagen är en checklista per nivå, utan eget menyval

Matchdagen ligger under varje nivå: `/gron/matchdagen/`, `/bla/matchdagen/` och `/rod/matchdagen/`. Ljusgrön har ingen matchdag (inga matcher). Det ersätter den gemensamma sidan `/matchdagen/` och menyvalet "Matchdagen". Huvudmenyn har nu tre val (Hem, Nivåer, Regler och dokument), och nivåsidans kort "Matchdagen" länkar till nivåns checklista. Den gamla adressen `/matchdagen/` går till `/nivaer/`.

- **En punkt kan gälla flera nivåer.** I `matchdagen/<säsong>.yaml` har varje punkt valfritt `levels` (utan det gäller den alla nivåer) och `homeOnly` (visas som "Hemmalag/arrangör"). Resultatrapportering, domararvode och domartillsättning skiljer sig mellan nivåerna och ligger därför som egna punkter per nivå.
- **Enklare än förut.** Punkterna visar inte längre regeltyp (föreningsvägledning, distriktsanpassning) eller källa och kontrolldatum per punkt. Källorna står en gång längst ned på sidan, med ett kontrolldatum för hela checklistan. Det som ändå är en regel ska stå i nivåguiden (ADR 0002 och 0003), inte i checklistan.
- **Färre länkar.** Sidan länkar bara till det som checklistan bygger på (VIBF:s manual för sammandrag, ungdomsmatrisen, Lokala förutsättningar) och till aktuell information om matchflytt.
- **Manualen är från en annan säsong.** VIBF:s manual (uppdaterad 2025-12-09) avser säsongen 2025/26. Sidan säger det, och där manualen och ungdomsmatrisen för 2026/27 skiljer sig gäller matrisen (till exempel vem som tillsätter domare i division 7, som därför inte nämns i checklistan).
- **Matchflytt** anger fortfarande inga avgifter eller tidsgränser (de ändras), bara en länk till aktuell information.
- **Utskrift:** sidan skrivs ut utan navigation med färgbandet, checklistan och källornas webbadresser.

Matchdagen arkiveras inte som egna sidor (se `docs/saesongslivscykel.md`).
