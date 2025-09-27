# GitHub Copilot Usage Guide

This guide explains how to enable and get the most out of GitHub Copilot while working on the Watch Party frontend in Visual Studio Code.

## 1. Install the GitHub Copilot Extension
1. Open **VS Code**.
2. Go to the **Extensions** view (`Ctrl+Shift+X` / `Cmd+Shift+X`).
3. Search for **"GitHub Copilot"**.
4. Click **Install** on the GitHub Copilot extension published by GitHub.

## 2. Authenticate With GitHub
1. After installation, you will be prompted to sign in.
2. Click **Sign in to GitHub** and follow the browser prompts.
3. Authorize the **GitHub Copilot** extension to access your account.
4. Return to VS Code; Copilot should now be enabled for your account.

## 3. Configure Copilot Settings
Open the **Command Palette** (`Ctrl+Shift+P` / `Cmd+Shift+P`) and search for **"Copilot"** to adjust preferences:
- **Enable/Disable Copilot**: Toggle globally or per workspace.
- **Inline Suggestions**: Control whether Copilot offers ghost text suggestions.
- **Panel Suggestions**: Choose how and when Copilot shows multi-line completions.
- **Language Filters**: Allow Copilot to suggest code for specific languages.

For this project, ensure Copilot is enabled for **TypeScript**, **JavaScript**, **CSS**, and **Markdown** files.

## 4. Accepting or Rejecting Suggestions
- Press `Tab` to accept an inline suggestion.
- Press `Esc` to dismiss.
- Use `Alt+[` / `Alt+]` (`Option+[` / `Option+]` on macOS) to cycle through alternative completions.

## 5. Triggering Suggestions Manually
- Use `Ctrl+Enter` / `Cmd+Enter` to open the Copilot panel and request additional completions.
- Highlight a code block and run **Copilot: Explain This** from the Command Palette to get a description of the code’s behavior.

## 6. Working Effectively With Copilot
- **Provide context**: Write descriptive comments or function signatures so Copilot can infer intent.
- **Review carefully**: Treat Copilot suggestions as drafts; verify logic, types, and accessibility.
- **Follow project conventions**: Cross-check with `PLAN.md`, `MOCKED_DATA_CONVERSION_GUIDE.md`, and any `AGENTS.md` instructions before accepting suggestions.
- **Document decisions**: When Copilot helps generate significant logic, add comments or commit messages describing the rationale.

## 7. Troubleshooting
- If suggestions stop appearing, run **Developer: Toggle Developer Tools** to check for errors.
- Ensure you have an active Copilot subscription or trial linked to your GitHub account.
- Restart VS Code or reload the window (`Ctrl+Shift+P` / `Cmd+Shift+P` → `Developer: Reload Window`) if issues persist.

## 8. Privacy & Security Considerations
- Avoid accepting suggestions that inadvertently expose secrets or credentials.
- Review generated code for licensing conflicts when Copilot provides large snippets.

By following these steps, you can smoothly transition to using GitHub Copilot in VS Code and maintain productivity while integrating with the Watch Party frontend codebase.
