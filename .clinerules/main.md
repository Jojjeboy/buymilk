# Global Rules & Workflow

## Mandatory Validation

- **CRITICAL:** After every code change, and before reporting a task as complete, you MUST execute:
  `npm run validate`
- If the validation fails, you must analyze the errors, fix them, and run the command again until it passes.
- **Git Workflow:** Once `npm run validate` passes without any errors, you MUST perform a git commit and push the changes to the repository.
- Do not assume a change is safe without running this validation.

## General Workflow

- Always analyze the existing project structure before creating new files.
- When modifying existing logic, ensure that you maintain the current architectural patterns.
- Use `read_file` to understand the full context of a file before applying `replace_in_file`.
- Keep responses technical, direct, and concise.
