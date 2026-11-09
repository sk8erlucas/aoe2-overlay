# Code signing policy

Free code signing provided by [SignPath.io](https://signpath.io), certificate by [SignPath Foundation](https://signpath.org).

> **Status:** the application to SignPath Foundation has been submitted. Current releases are **not signed yet**; this policy applies from the first signed release.

## What gets signed

Only the Windows installers and the desktop binary of AoE2 Overlay, built from this repository by the [release workflow](.github/workflows/release.yml) on GitHub Actions when a version tag is pushed. Nothing built outside that workflow is signed.

The installer contains this project's code and its open source dependencies. The Microsoft game art in `apps/web/public/game-assets` is used only by the website and is not part of the installer; it is excluded from the MIT license, as explained in [its README](apps/web/public/game-assets/README.md).

## Team roles

| Role                     | Members                                     |
| ------------------------ | ------------------------------------------- |
| Committers and reviewers | [sk8erlucas](https://github.com/sk8erlucas) |
| Approvers                | [sk8erlucas](https://github.com/sk8erlucas) |

Every team member uses multi-factor authentication for GitHub and SignPath. Each signing request is approved manually by an approver.

## Privacy

The desktop app does not read the game's memory and does not inject code into it. It only connects to:

- `api.aoe2overlay.sitemaster.com.ar`, to download strategies and, if the user signs in, to sync favorites.
- `github.com`, to check for and download updates.

See the full [privacy policy](https://aoe2overlay.sitemaster.com.ar/privacidad).

## Reporting a problem

To report a compromised or malicious release, use **Report a vulnerability** in the [Security tab](https://github.com/sk8erlucas/aoe2-overlay/security).
