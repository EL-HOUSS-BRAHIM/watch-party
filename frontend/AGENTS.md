# Agent Instructions for Watch Party Frontend

These guidelines apply to the entire repository unless a subdirectory overrides them with a nested `AGENTS.md` file.

## Workflow Expectations
- **Read the plan**: Review `PLAN.md`, `MOCKED_DATA_CONVERSION_GUIDE.md`, and relevant docs before making changes so work stays aligned with the roadmap.
- **Prefer VS Code-compatible output**: Structure changes and explanations so they are easy to consume in Visual Studio Code.
- **Document context**: When adding or modifying significant logic, include concise comments or update documentation to capture intent.

## Code Quality & Testing
- Run `npm run lint` and `npm run test` whenever code is modified. If a command fails because dependencies are unavailable in the environment, note the failure reason explicitly in the final report.
- Ensure TypeScript types stay accurate; fix new `tsc` errors if they appear.
- Keep accessibility considerations in mind for UI changes (aria labels, keyboard navigation, color contrast).

## Git & Review Hygiene
- Group related changes into a single commit with a clear message.
- Avoid force pushes or history rewrites on shared branches.
- Update or add documentation/tests alongside feature changes whenever practical.

## Collaboration Tips
- Prefer live API integrations over mock data. If mock data must remain, leave a TODO comment linking to the relevant backend endpoint.
- Keep Copilot-generated code under review; verify it matches project style and security expectations.
