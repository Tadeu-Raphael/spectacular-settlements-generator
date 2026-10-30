<div align="center">

# 🏰 Spectacular Settlements Generator

### The RPG Settlement Generator

Roll full settlements for your tabletop adventures: trading posts, villages, towns, cities, capitals and fortresses, with encounters, rumors, taverns and more.

**Static site · Plain JavaScript · Bootstrap 5 · English 🇬🇧🇺🇸 / Portuguese 🇧🇷**

</div>

---

## ✨ Features

- 🎲 **Full dice-driven generation.** Every result comes from the book tables, with modifiers carried from one roll to the next.
- 🔁 **Roll again.** Each page has a button that rolls a brand-new settlement without leaving the page.
- 📊 **Information card.** Lists every applied modifier and every die roll (die, result, modifier and total) behind the result.
- ✦ **Extras.** Encounters, rumors, taverns (Tavern Builder), local production, scene details, adventure hooks and personnel issues. Extra terms are highlighted and open a description when clicked.
- 🗺️ **Fortress figures.** Keeps, castles and strongholds include reference drawings for plans, walls and layouts.
- 💾 **TXT export.** Download everything shown on the page, including the Information summary and the extras you rolled.
- 🌐 **Bilingual.** Click the Brazil or UK/USA flag in the footer. Your choice is remembered, the browser language is the default (English if unknown), and switching language replays the *same* roll in the other language.

## 📋 Generators

| Generator      | Status         |
| -------------- | -------------- |
| Trading Post   | Done ✅        |
| Village        | Done ✅        |
| Town           | Done ✅        |
| City           | Done ✅        |
| Capital        | Done ✅        |
| Keep           | Done ✅        |
| Castle         | Done ✅        |
| Stronghold     | Done ✅        |
| Encounters     | Done ✅        |
| Extras         | Done ✅        |

> The rules and tables follow the book *Spectacular Settlements*. Keeps, castles and strongholds are cumulative: a castle includes a keep, and a stronghold includes both.

## 🚀 Running locally

The shared header and footer are loaded with `fetch`, so the site must be served over HTTP instead of opening the HTML files directly:

```bash
python -m http.server
```

Then open <http://localhost:8000>.

## 🗂️ Project structure

```
├── index.html                 # Main menu
├── trading-post.html          # Generator pages
├── villages.html
├── towns.html
├── cities.html
├── capitals.html
├── keep.html / castle.html / stronghold.html
├── extras.html                # Standalone extras (encounters, rumors, taverns...)
├── components/
│   ├── header/header.html     # Shared header
│   └── footer/footer.html     # Shared footer (language flags, credits)
├── css/
│   └── stylesheet.css         # All of the project's styles
├── js/
│   ├── i18n.js                # Language switcher and seeded randomness
│   ├── lang/pt-book.js        # Portuguese translation of the book content
│   ├── generation-info.js     # Information card (modifiers and dice rolls)
│   ├── generation-export.js   # TXT export
│   ├── extras.js              # Extras card and generators
│   ├── extras-data.js         # Appendix tables (encounters, rumors, glossary...)
│   └── *.js                   # One generator script per settlement type
└── vendor/bootstrap/          # Bootstrap 5.2.3, served locally (no CDN)
```

## 🧩 How it works

- **Shared layout.** Each page reserves `#site-header` and `#site-footer`; `js/layout.js` fills them from `components/`.
- **Information card.** `js/generation-info.js` must load before the generator script. Generators call its `rollDie` and `logMod` helpers so every roll and modifier can be listed.
- **Translations.** Display text in the generator scripts is wrapped as `__("English text")`, and `js/lang/pt-book.js` maps each English string to Portuguese. Generation uses a seeded random number generator, so reloading with the same seed in another language gives the same roll. Rolls must never depend on translated text.

## 🛠️ Built with

- HTML, CSS and vanilla JavaScript (no build step)
- [Bootstrap](https://getbootstrap.com/) 5.2.3, bundled in `vendor/bootstrap/`
- Hosted on GitHub Pages

## 🏆 Credits

Created by [Tadeu Raphael](https://github.com/Tadeu-Raphael), originally developed during [Backdrop Build](https://backdropbuild.com/).
