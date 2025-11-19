TypeScript interfaces must start with "I" (e.g., IMyInterface).
Always reduce method cyclomatic complexity (extract descriptive private helpers).
Private variables/methods must start with "_".
Add and maintain English doc comments for all relevant methods.
After proposing changes, refactor to keep code simple and readable.
Replace important constant strings/numbers with named constant variables (avoid magic values; give meaningful names and rationale).
Exported variables, methods, and interfaces must be descriptive, well-named, and documented.
If a method has many parameters, use a params object; document each attribute and why it exists.
When starting work on a new project, check if it's a Turborepo monorepo, and if so, scan all packages.

When working with React Components, always try to create generic components to be reused in other components.
When working with React Components, try to simplify and reduce code complexity by creating subcomponents.