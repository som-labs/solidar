# Solidar Developer Guide

## Welcome

So you want to contribute to this project.
Thanks in advance for your time and effort.

Consider getting in contact with the
[SomLabs community](https://som-labs.github.io/community/).
You are very welcome to join in.

## Technologies

- [<img width="64px" src="https://upload.wikimedia.org/wikipedia/commons/f/f1/Vitejs-logo.svg"/> Vite](https://vitejs.dev/) as building tool
- [<img width="64px" src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg"/> React](https://react.dev/) as UI framework
- [<img width="64px" src="https://mui.com/static/logo.png"/> MUI](https://mui.com/) as component library

## Code style

It's encoded into editorconfig and prettier.
Configure your editor and just let them take over.

Separate styling related changes from actual code changes in different commits
to avoid actual changes getting obfuscated in the diffs.

## Code layout

Source code inside `src` is organized in directories by vertical (page/feature) slicing.
Those directories are UpperCamelCase.

Horizontal slicing (per object type: components, hooks, services, data...)
is used for shared code and they are located at top level.
They use lowercase names.
Horizontal slices may be also used to split huge vertical slices.

Keep one file per component and name the file like the component with jsx extension.
Name test files like their SUT with `.test.` infix and place them in the same directory.

TODO: Naming convention for non component files.

## Branching and PR's

- Open a feature branch
- Branch naming:
    - `NEW_my_new_functionality`
    - `IMP_my_functionality_improvement`
    - `REF_my_code_improvement`
    - `FIX_the_bug_i_fixed`
- Open a PR as soon as you create the branch
    - Decide the PR is [Ask or Show](https://martinfowler.com/articles/ship-show-ask.html)
    - A PR template is provided
- Keep feature branches short in time and content
- Long lived branches are hard to merge, to ease integration of unfinished features we recommend:
    - Hide the feature from the user or use a feature flag until ready
    - Keep your branch ready to merge by avoiding code breaking commits
- Rebase often (~daily) your branch on `main` during its development
    - Your commits will be reapplied on top of `main`
        - Ensure your local main and feature branches are updated to last remote version
        - Ensure you are on your feature branch
        - `git rebase origin/main --autostash`
        - `git push -f` Caution, just in the feature branch, not main
    - You will have to solve any conflicts your commits create with already integrated code.
        - Reduces merge tension with wide changes already integrated on master
        - Increases merge tension of your wide changes, you will want to integrate
- Integrate into main
    - Review your changes are in CHANGES.md under `## Unreleased`
    - Ensure you have all remote changes with `git fetch`
    - Do a last rebase on origin/master before merging
    - Merge with `--no-ff`

## Releasing

- Releases are done in the `main` branch
- Decide the new version number `M.m.p` using [semantic versioning](https://semver.org/)
    - M (major) backward incompatible changes or major rewrite
    - m (minor) backward compatible new features
    - p (patch) backward compatible bug fixes
- Change the version in package.json
- Review CHANGES.md:
    - Add any user significant changes to the `## Ureleased` section on the top of the file
    - Document any changes relevant to deployers (configuration, layout...) under a point named "Upgrade notes".
    - Rename the title `## Unreleased` as `## M.m.p  (YYYY-MM-DD)` (Year, month, day)
- Bump commit and tag:
    - `git commit -m "🏗️ bump to M.m.p" package.json CHANGES.md`
    - `git push`
    - `git tag solidar-M.m.p`
    - `git push --tags`

## Deploying on server

```bash
npm run build
# TODO
```

