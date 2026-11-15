# Nivåsidan är ett blad, och ljusgrön är en nivå utan divisioner

Nivåsidan (`/gron/`, `/bla/`, `/rod/`, `/ljusgron/`) är ledarens enda uppslagsplats för en nivå. Den görs om till ett blad: ett färgband med nivåns spelform och logga, följt av en snabb översikt i ikonrader i två kolumner. Dokument, matchdagens checklista, divisionsanpassningar, källor och regelhierarki ligger under bladet.

- **Ett blad per nivå, inte per division.** Det som är gemensamt för divisionerna står en gång. Det ersätter det separata spelformsbladet som först byggdes i spelutbildningen, så att regelfakta inte lagras på två ställen (ADR 0002 gäller fortfarande: fakta ägs av nivåguiden).
- **Ordning på sidan:** hero, divisionsrutor, "Nytt för säsongen", bladet, Viktiga dokument och Matchdagen (checklistan öppen), länk till spelutbildningen, källor och kontrolldatum, divisionsanpassningar, regelhierarki. Bladet har rubriken "Snabb översikt".
- **Utskrift:** bladet på sida 1, matchdagens checklista på sida 2. Dokumentlänkar, "Nytt för" och spelutbildningslänken skrivs inte ut. Kontrolldatum och originalkällor skrivs fortfarande ut (kravet från utskriftstesterna).
- **Ljusgrön är en nivå utan divisioner.** Den har en egen nivåguide (`ljusgron.yaml`) utan `divisions`, med egna obligatoriska fakta (matcher, lagstart, träning, ledare, utrustning), och visar varken divisionsrutor, "Nytt för", dokument eller matchdag. Uppgifterna är Moälvens egen föreningsvägledning och har ingen distriktskälla.
- **Nivåguiden får tre nya fält** som visas i färgbandet: `undertitel`, `alder` och `spelformKort`. De är valfria så att äldre säsonger och testfixturer fortsätter bygga.
- **Divisionssidorna** (ADR 0004) ska bli mycket sparsamma och bara visa det som skiljer en division från nivåsidan, eftersom nivåsidan nu bär nästan all information. Det görs som ett separat steg; ADR 0004 gäller tills dess.

Spelidé, principer, övningar och träningspass finns inte här utan i spelutbildningen. Nivåsidan länkar dit (`src/lib/lankar.ts`).
