# Pending tasks

## Phase 1: Initial Setup

- [x] Vite bootstrap
- [x] Code structure
- [x] Translations
- [x] License
- [x] Documentation files
- [x] linter, editorconfig, prettier
- [x] README
- [x] CHANGES
- [x] AppFrame
- [x] AppFrame: Change language button
- [x] AppFrame: Change theme button
- [x] Scoped translation ids
- [x] Page router
- [x] AppFrame: Responsive
- [x] AppFrame: App icon
- [x] AppFrame: Common Footer
- [x] Home
- [x] Data driven based on yaml's
- [x] Footer: Remove link colors and decoration
- [ ] Footer: Responsive: do not wrap text, wrap elements
- [ ] Home: Responsive intro
- [ ] Continuous integration and deployment
- [ ] Fix: Weblate link gives unneded access to local storage because how we are redirecting (see console)
- [ ] Theme: Because primary is that green, theme greys look pinky and look award. What about reducing the red component?
- [ ] Consider lazy route loading https://reactrouter.com/en/main/route/route#lazy

## Phase 2: First integration with Madrid team code

- Error Page
- Home page:
    - [ ] Home: Images for intro: copyleft, vectorized and using current-color
    - [ ] Home: Images for collective install: copyleft, vectorized and using current-color
    - [ ] Home: Images for individual install: copyleft, vectorized and using current-color
    - [ ] Home: Change install type image color on hover (using current-color, alternatively use css-filter or opacity)
    - [ ] Home: populate src/data/articles.yaml
- Simulator:
    - [ ] Simulator: Top level wizard component
    - [ ] Simulator: Second level wizard component
    - [ ] Simulator: Default simulator configuration as yaml
    - [ ] Simulator: Store modified simulator configuration in localstorage
    - [ ] Simulator Toolbar
    - [ ] Import old code into src/services/legacy/ to start integrating
    - [ ] Define inteface between legacy code and react code
    - [ ]

## To talk with Jose Luis

- Translations:
    - Do not fill ca and gl translations with spanish strings, empty strings are marked as pending to translators, but filled ones don't
    - Yaml: using `\n` does not have any effect in strings starting with |, just add an extra return, anyway html will collapse then but...
    - What about using markdown in translated texts and adding a markdown component? (Markdown component from OpenData)
    - Translated strings in uppercase are not ok. Use normal casing and use styling to make them UPPERCASE. Buttons and tabs already does that. Consider joining UPPERCASE and Lowercase version of the same translation.
    - Translation Ids should be UPPERCASE. Most come from legacy and it is ok but, let's try to change them as we use them. Same with scoping.
