# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`GLOSSARY.md`** at the repo root.
- **`docs/adr/`**: read ADRs that touch the area you're about to work in.

If any file does not exist, proceed silently. The domain-modeling skill creates these files lazily when terms or decisions are resolved.

## File structure

This is a single-context repository:

```
/
├── GLOSSARY.md
├── docs/adr/
└── src/
```

## Use the glossary's vocabulary

When output names a domain concept, use the term defined in `GLOSSARY.md`. Do not drift to synonyms the glossary explicitly avoids.

If a required concept is missing, reconsider whether new language is necessary or note the gap for domain modeling.

## Flag ADR conflicts

If output contradicts an existing ADR, surface the conflict explicitly rather than silently overriding it.
