# Contributing to Mute

First off, thanks for taking the time to contribute!

The following is a set of guidelines for contributing to Mute and its dependencies, which are hosted in the [Coast Organization](https://github.com/coast-team) on GitHub. These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

This document is inspired by [Atom Contributing Guidelines](https://github.com/atom/atom/blob/master/CONTRIBUTING.md).

## Table Of Contents

[Code of Conduct](#code-of-conduct)

[What should I know before I get started?](#what-should-i-know-before-i-get-started)

- [Mute objectives and dependencies.](#mute-objectives-and-dependencies)

[How Can I Contribute?](#how-can-i-contribute)

- [Reporting Bugs](#reporting-bugs)
- [Suggesting Enhancements](#suggesting-enhancements)
- [Your First Code Contribution](#your-first-code-contribution)
- [Pull Requests](#pull-requests)

[Styleguides](#styleguides)

- [Git Commit Messages](#git-commit-messages)
- [Typescript Styleguide](#typescript-styleguide)
- [Specs Styleguide](#specs-styleguide)
- [Documentation Styleguide](#documentation-styleguide)

[Additional Notes](#additional-notes)

- [Issue and Pull Request Labels](#issue-and-pull-request-labels)

## Code of Conduct

This project and everyone participating in it is governed by the [Contributor Covenant](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## What should I know before I get started

### Mute objectives and dependencies

Mute is an open-source project led by the [Coast Team](https://team.inria.fr/coast/) in Loria/Inria Grand Est. It's a P2P collaborative text-editor
that implements conflict-free merge algorithm for synchronous/asynchronous collaborations:

[André et al., 2013] Luc André, Stéphane Martin, Gérald Oster et Claudia-Lavinia Ignat. **Supporting Adaptable Granularity of Changes for Massive-scale Collaborative Editing**. In _Proceedings of the international conference on collaborative computing: networking, applications and worksharing - CollaborateCom 2013_. IEEE Computer Society, Austin, Texas, USA, october 2013, pages 50–59. doi: [10.4108/icst.collaboratecom.2013.254123](https://dx.doi.org/10.4108/icst.collaboratecom.2013.254123). url: <https://hal.inria.fr/hal-00903813>.

Mute is based on several dependencies which implements a part of the algorithm and which can be reused for other project.

Here's a list of the big ones:

- [Mute](https://github.com/coast-team/mute) - Mute client part. It's the main component of Mute which consist of Angular Web App.
- [Mute-Core](https://github.com/coast-team/mute-core) - Mute Service part: provide construction of Mute data structures and communication between
  Mute client and Netflux.
- [Netflux](https://github.com/coast-team/netflux) - P2P network algorithm which is in charge of communication. It implements several network topology and is built over WebSocket.
- [Mute-structs](https://github.com/coast-team/mute-structs) - Defines Mute Data structures for messages and communication protocol.

There are many more (like bot-storage or identification package), but this list should be a good starting point.

## How Can I Contribute

### Reporting Bugs

This section guides you through submitting a bug report for Mute. Following these guidelines helps maintainers and the community understand your report :pencil:, reproduce the behavior :computer: :computer:, and find related reports :mag_right:.

Before creating bug reports, please check [this list](#before-submitting-a-bug-report) as you might find out that you don't need to create one. When you are creating a bug report, please [include as many details as possible](#how-do-i-submit-a-good-bug-report). Fill out [the required template](ISSUE_TEMPLATE.md), the information it asks for helps us resolve issues faster.

> **Note:** If you find a **Closed** issue that seems like it is the same thing that you're experiencing, open a new issue and include a link to the original issue in the body of your new one.

#### Before Submitting A Bug Report

- **Determine [which repository the problem should be reported in](#mute-objectives-and-dependencies)**.
- **Perform a [cursory search](https://github.com/issues?utf8=%E2%9C%93&q=is%3Aissue+user%3Acoast-team)** to see if the problem has already been reported. If it has **and the issue is still open**, add a comment to the existing issue instead of opening a new one.

#### How Do I Submit A (Good) Bug Report

Bugs are tracked as [GitHub issues](https://guides.github.com/features/issues/). After you've determined [which repository](#mute-objectives-and-dependencies) your bug is related to, create an issue on that repository and provide the following information by filling in [the template](ISSUE_TEMPLATE.md).

Explain the problem and include additional details to help maintainers reproduce the problem:

- **Use a clear and descriptive title** for the issue to identify the problem.
- **Describe the exact steps which reproduce the problem** in as many details as possible. **Don't just say what you did, but explain how you did it**. For example, if you moved the cursor to the end of a line, explain if you used the mouse or a keyboard shortcut.
- **Provide specific examples to demonstrate the steps**. Include links to files or GitHub projects, or copy/pasteable snippets, which you use in those examples. If you're providing snippets in the issue, use [Markdown code blocks](https://help.github.com/articles/markdown-basics/#multiple-lines).
- **Describe the behavior you observed after following the steps** and point out what exactly is the problem with that behavior.
- **Explain which behavior you expected to see instead and why.**
- **Include screenshots and animated GIFs** which show you following the described steps and clearly demonstrate the problem. You can use [this tool](http://www.cockos.com/licecap/) to record GIFs on macOS and Windows, and [this tool](https://github.com/colinkeenan/silentcast) or [this tool](https://github.com/GNOME/byzanz) on Linux.
- **If the problem wasn't triggered by a specific action**, describe what you were doing before the problem happened and share more information using the guidelines below.
- **Inclued log from your collaborative session**, use the button in bottom-right of Mute to download your log file.

Provide more context by answering these questions:

- **Can you reproduce the problem in latest version or in production version?**
- **Did the problem start happening recently** (e.g. after cache wipe) or was this always a problem?
- If the problem started happening recently, **can you reproduce the problem in an older version of Mute?** What's the most recent version in which the problem doesn't happen?
- **Can you reliably reproduce the issue?** If not, provide details about how often the problem happens and under which conditions it normally happens.

Include details about your configuration and environment:

- **Which version of Mute are you using?**
- **What's the name and version of the OS you're using**?
- **What's the name and version of the browser you're using**?

### Suggesting Enhancements

This section guides you through submitting an enhancement suggestion for Mute, including completely new features and minor improvements to existing functionality. Following these guidelines helps maintainers and the community understand your suggestion :pencil: and find related suggestions :mag_right:.

Before creating enhancement suggestions, please check [this list](#before-submitting-an-enhancement-suggestion) as you might find out that you don't need to create one. When you are creating an enhancement suggestion, please [include as many details as possible](#how-do-i-submit-a-good-enhancement-suggestion). Fill in [the template](ISSUE_TEMPLATE.md), including the steps that you imagine you would take if the feature you're requesting existed.

#### Before Submitting An Enhancement Suggestion

- **Check the [Projects page](https://github.com/coast-team/mute/projects) and [Milestones](https://github.com/coast-team/mute/milestones)** to see the objectives and evolution of the project. Most importantly, check if you're using the latest version of Mute and if you can get the desired behavior by deploying your own version with custom configuration.
- **Determine [which repository the enhancement should be suggested in](#mute-objectives-and-dependencies).**
- **Perform a [cursory search](https://github.com/issues?utf8=%E2%9C%93&q=is%3Aissue+user%3Acoast-team)** to see if the enhancement has already been suggested. If it has, add a comment to the existing issue instead of opening a new one.

#### How Do I Submit A (Good) Enhancement Suggestion

Enhancement suggestions are tracked as [GitHub issues](https://guides.github.com/features/issues/). After you've determined [which repository](#mute-and-dependencies) your enhancement suggestion is related to, create an issue on that repository and provide the following information:

- **Use a clear and descriptive title** for the issue to identify the suggestion.
- **Provide a step-by-step description of the suggested enhancement** in as many details as possible.
- **Provide specific examples to demonstrate the steps**. Include copy/pasteable snippets which you use in those examples, as [Markdown code blocks](https://help.github.com/articles/markdown-basics/#multiple-lines).
- **Describe the current behavior** and **explain which behavior you expected to see instead** and why.
- **Include screenshots and animated GIFs** which help you demonstrate the steps or point out the part of Mute which the suggestion is related to. You can use [this tool](http://www.cockos.com/licecap/) to record GIFs on macOS and Windows, and [this tool](https://github.com/colinkeenan/silentcast) or [this tool](https://github.com/GNOME/byzanz) on Linux.
- **Explain why this enhancement would be useful** to most Mute users.
- **List some other text editors or applications where this enhancement exists.**
- **Specify which version of Mute you're using.**
- **Specify the name and version of the OS you're using.**
- **Specify the name and version of the Browser you're using.**

### Your First Code Contribution

Unsure where to begin contributing to Mute? You can start by looking through `help-wanted` issues or contribute to documentation.

#### Local development

All packages can be developed locally, by checking out the corresponding repository and [linking](https://yarnpkg.com/lang/en/docs/cli/link/) the package to Mute or [packing](https://yarnpkg.com/lang/en/docs/cli/pack/) the dependency:

```bash
#With yarn
yarn build && yarn pack
#With npm
npm build && npm pack
```

If you're using Yarn, do not forget to clean the cache after packing the dependency and before installing it in Mute:

```bash
yarn cache clean
```

### Pull Requests

- Fill in [the required template](PULL_REQUEST_TEMPLATE.md)
- Do not include issue numbers in the PR title
- Include screenshots and animated GIFs in your pull request whenever possible.
- Follow the [Typescript](#typescript-styleguide) styleguides.
- Include thoughtfully-worded, well-structured [Jasmine](http://jasmine.github.io/) specs. See the [Specs Styleguide](#specs-styleguide) below.
- Document new code based on the [Documentation Styleguide](#documentation-styleguide)
- End all files with a newline
- Avoid browser-dependent and platform-dependent code.

## Styleguides

### Git Commit Messages

Mute repositories use [commitizen](https://github.com/commitizen/cz-cli) to format
git commit messages.

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

### Typescript Styleguide

Styleguide for Typescript are defined in each repository within .tslint file.
The global styleguide is the one from [Angular Styleguide](https://angular.io/guide/styleguide).

### Specs Styleguide

Some project use Ava for spec and some other use Jasmine. You could use the one already present in the repository
or configure Jasmine.

- Treat `describe` as a noun or situation.
- Treat `it` as a statement about state or how an operation changes state.

#### Example

```typescript
describe ('a dog', () => {
  it ('barks', () => {
    # spec here
    describe ('when the dog is happy', () => {
      it ('wags its tail', () => {
        # spec here
      })
    })
  })
})
```

### Documentation Styleguide

- Use [Markdown](https://daringfireball.net/projects/markdown).

## Additional Notes

### Issue and Pull Request Labels

This section lists the labels we use to help us track and manage issues and pull requests. Most labels are used across all Coast team repositories, but some are specific to `coast-team/mute`.

[GitHub search](https://help.github.com/articles/searching-issues/) makes it easy to use labels for finding groups of issues or pull requests you're interested in. To help you find issues and pull requests, each label is listed with a description of when they are used. We encourage you to read about [search filters](https://help.github.com/articles/searching-issues/) which will help you write more focused queries.

The labels are loosely grouped by their purpose, but it's not required that every issue have a label from every group or that an issue can't have more than one label from the same group.

Please open an issue on `coast-team/mute` if you have suggestions for new labels, and if you notice some labels are missing on some repositories, then please open an issue on that repository.

#### Type of Issue and Issue State

| Label name    | Description                                                                                                                      |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `bug`         | Confirmed bugs or reports that are very likely to be bugs.                                                                       |
| `deploy`      | Features or bugs related to deployment of the application.                                                                       |
| `dev`         | Features or bug related to dev-tools. (logs, etc...)                                                                             |
| `duplicate`   | Issues which are duplicates of other issues, i.e. they have been reported before.                                                |
| `enhancement` | Feature requests.                                                                                                                |
| `help-wanted` | The Coast team would appreciate help from the community in resolving these issues.                                               |
| `invalid`     | Issues which aren't valid (e.g. user errors).                                                                                    |
| `optional`    | Features that are not a priority for Coast Team.                                                                                 |
| `question`    | Questions more than bug reports or feature requests (e.g. how do I do X).                                                        |
| `ui`          | Features or bugs that are purely aesthetics.                                                                                     |
| `use case`    | Description of use-case which need an implementation proposition or feature proposition.                                         |
| `wontfix`     | The Coast team has decided not to fix these issues for now, either because they're working as intended or for some other reason. |

#### Pull Request Labels

| Label name         | Description                                                                              |
| ------------------ | ---------------------------------------------------------------------------------------- |
| `work-in-progress` | Pull requests which are still being worked on, more changes will follow.                 |
| `needs-review`     | Pull requests which need code review, and approval from maintainers or Coast team.       |
| `under-review`     | Pull requests being reviewed by maintainers or Coast team.                               |
| `requires-changes` | Pull requests which need to be updated based on review comments and then reviewed again. |
| `needs-testing`    | Pull requests which need manual testing.                                                 |
