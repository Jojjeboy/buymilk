# Global Rules & Workflow

## Mandatory Validation

- **CRITICAL:** After every code change, and before reporting a task as complete, you MUST execute:
  `npm run validate`
- If the validation fails, you must analyze the errors, fix them, and run the command again until it passes.
- **Git Workflow (Feature Branching):** For every new functionality or significant fix, you MUST follow this process:
  1. **Branching:** Create a new feature branch: `git checkout -b feature/description`.
  2. **Development:** Implement changes and ensure `npm run validate` passes locally.
  3. **Push:** Commit and push the feature branch: `git push origin feature/description`.
  4. **CI Verification:** Use `gh run list` or check GitHub to ensure the CI build passes.
  5. **Merge:** Once verified, merge into main:
     - `git checkout main`
     - `git merge feature/description`
     - `git push origin main`
  6. **Cleanup:** Delete the feature branch locally and remotely:
     - `git branch -d feature/description`
     - `git push origin --delete feature/description`
- Do not assume a change is safe without running this validation.

## General Workflow

- Always analyze the existing project structure before creating new files.
- When modifying existing logic, ensure that you maintain the current architectural patterns.
- Use `read_file` to understand the full context of a file before applying `replace_in_file`.
- Keep responses technical, direct, and concise.
