# Solidar

Dimensioner for roof solar panel installations

## About Solidar

TODO: A more verbose description of the project

## Copying

This software is licensed under a GNU Affero Licence 3.0 or later.
A short non-binding summary of it is that
you have the right to **use, modify and distribute** it
as long as you grant the **same rights to the users**
you redistribute to, including your modifications
and considering **online use as redistribution**.

[Full binding version of the License](LICENSE)


## Development setup

```bash
git clone git@github.com:som-labs/solidar.git
cd solidar
npm install
npm run dev
```

## Branching and PR's

- Open a feature branch
- Branch naming:
    - `NEW_my_new_functionality`
    - `IMP_my_functionality_improvement`
    - `REF_my_code_improvement`
    - `FIX_the_bug_i_fixed`
- Open a PR filling the template provided
- Keep feature branches short in time and content
- Long lived branches are hard to merge, to ease integration of unfinished features we recommend:
    - Keep you feature branch always running
    - Add feature flags in configuration to disable the feature until finished
    - Or make you feature unreachable for regular users (unlinked url...) until ready
- Rebase the branch on `main` before merging (and often, during development)
    - Your commits will be reapplied on top of `master`
    - You will have to solve any conflicts your commits create with already integrated code.


## Releasing

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


