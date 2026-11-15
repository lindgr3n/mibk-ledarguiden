# Inget regelavsnitt på nivåsidan

Ersätter delen av ADR 0003 som gällde avsnittet "Regler och källor" på nivåsidan. Avsnittet (förklaringsrutan med Nationell regel, Distriktsanpassning och Föreningsvägledning, och regeluttalanden per nivå) är borttaget: det upprepade mest översikten, fyllde sidan med text, och kunde motsäga matrisen (till exempel "en eller två matchledare" och målburen 90 × 60 cm på grön nivå, när matrisen anger en föreningsdomare och 60 × 40 cm).

- **Det som var användbart finns kvar som fakta.** De lokala reglerna från ungdomsmatrisens sida 2 är en faktagrupp ("Lokala regler", nyckeln `lokalregel`) och visas som raden "Lokal regel" i översikten, på grön, blå och röd nivå.
- **Källhierarkin består på faktanivå.** Varje faktagrupp har fortfarande källa, kontrolldatum och regeltyp (`ruleSource`), som visas under "Källor och kontrolldatum" och på divisionskorten. Nationell regel, distriktsanpassning och föreningsvägledning skiljs alltså fortfarande åt där det behövs, men inte som ett eget avsnitt.
- **Borttaget:** `ruleSections` i nivåguiden, `RuleHierarchy.astro`, regelhierarkins testsida och tester, och motsvarande CSS och säsongsskriptets hantering av regeluttalanden. En nationell regel som skiljer sig från distriktets ska stå som en divisionsanpassning (ADR 0002) eller en faktagrupp, inte som ett eget avsnitt.
