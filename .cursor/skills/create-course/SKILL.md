---
name: create-course
description: "Create a new LINK Pro online course page with hero, progress tracking, lesson list, and localStorage completion. Use when the user asks to add, build, or scaffold a new course page."
---

# Create a LINK Pro Course Page

Create self-contained static course pages that match the LINK Pro homepage design system and reuse the interaction model from `pelvis-1-course.html`.

## When to Use

Use this skill when the user wants to:
- add a new online course page
- scaffold another course like Pelvis 1.0
- create lesson lists with progress tracking

## Reference Files

| File | Purpose |
|------|---------|
| `courses/course-template.html` | Copy this to start a new course |
| `pelvis-1-course.html` | Working reference implementation |
| `index.html` | Homepage design tokens and nav patterns |
| `courses.html` | Course catalog cards to link from |

## Workflow

### 1. Gather course inputs

Collect from the user (or infer from context):

| Input | Example | Used for |
|-------|---------|----------|
| `slug` | `pelvis-3` | filename, storage key, reset message |
| `title` | `Pelvis 3.0` | `<title>`, hero, reset confirm |
| `titleHtml` | `Pelvis <em>1.0</em>` | hero `<h1>` inner HTML |
| `series` | `Pelvis Series` | hero eyebrow |
| `description` | paragraph text | hero description + meta description |
| `lessons` | array of `{ title, duration, description }` | lesson list + modal |

**Slug rules:** lowercase, hyphenated, no spaces. Filename must be `{slug}-course.html`.

**Storage key:** `linkpro-{slug}-progress` — must be unique per course.

### 2. Create the course page

```bash
cp courses/course-template.html {slug}-course.html
```

Replace every `{{PLACEHOLDER}}` in the new file:

| Placeholder | Replace with |
|-------------|--------------|
| `{{SLUG}}` | course slug |
| `{{TITLE}}` | full course title |
| `{{TITLE_HTML}}` | hero heading inner HTML (e.g. `Pelvis <em>1.0</em>`) |
| `{{SERIES}}` | series label for eyebrow |
| `{{DESCRIPTION}}` | hero + meta description |
| `{{LESSON_COUNT}}` | number of lessons |
| `{{LESSONS_JSON}}` | JavaScript array of lesson objects |
| `{{RESET_LABEL}}` | short name for reset confirm dialog |

**Lessons JSON format** (keep valid JS):

```javascript
[
  { title: 'Lesson Title', duration: '18 min', description: 'Lesson summary shown in the modal.' }
]
```

Do **not** change CSS, HTML structure, or JavaScript behavior unless the user explicitly asks. Only swap course-specific content and the `lessons` / `storageKey` values.

### 3. Link from the catalog

Update `courses.html` (and `index.html` `.courses` section if the course should appear on the homepage):

- Point the course card CTA to `{slug}-course.html`
- Match card title, description, price, and lesson count to the new course

Use relative links only (no `target="_blank"` for internal course pages).

### 4. Verify behavior

Start a local server and manually test:

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080/{slug}-course.html` and confirm:

1. Hero shows correct title, description, and lesson count
2. Progress starts at 0% with an empty bar
3. Opening a lesson shows the modal with correct content
4. Marking a lesson complete updates:
   - progress percentage and count
   - progress bar fill
   - lesson row (`Complete` label, checkmark, `Review` button)
   - hero CTA text (`Start` → `Continue` → `Review`)
5. Previous / next navigation works
6. Progress persists after page reload (`localStorage`)
7. Reset clears progress after confirmation
8. Mobile layout works at ~400px width

Use the `walkthrough-artifacts` skill if demo evidence is needed.

## Page Structure (do not remove)

Every course page includes these sections in order:

1. **Hero** — title, description, start/continue button, lesson count
2. **Progress** — percentage, count, animated bar (`role="progressbar"`)
3. **Curriculum** — dynamically rendered lesson list
4. **Lesson modal** — video placeholder, description, prev/next, mark complete
5. **Footer** — standard LINK Pro footer

## Styling Rules

Match the homepage (`index.html`) design system:

- Fonts: `Inter` (UI), `Playfair Display` (headings)
- Colors: `--charcoal`, `--cream`, `--gold`, `--gold-dark`
- Do not copy screenshot-specific styling from mockups
- Keep inline CSS in the page (this repo has no shared CSS bundle)

## Naming Conventions

| Item | Pattern | Example |
|------|---------|---------|
| File | `{slug}-course.html` | `pelvis-3-course.html` |
| Storage key | `linkpro-{slug}-progress` | `linkpro-pelvis-3-progress` |
| Page title | `{Title} Course — LINK Pro` | `Pelvis 3.0 Course — LINK Pro` |

## What Not to Do

- Do not add a build step, framework, or backend for v1
- Do not share one `localStorage` key across courses
- Do not embed real video URLs unless the user provides them (placeholder is fine)
- Do not duplicate CSS into a shared file unless the user asks to refactor
- Do not change unrelated pages

## Example Request → Output

**User:** "Create a Pelvis 3.0 course with 3 lessons."

**Agent actions:**
1. Copy `courses/course-template.html` → `pelvis-3-course.html`
2. Fill placeholders for Pelvis 3.0 content and 3 lessons
3. Set `storageKey` to `linkpro-pelvis-3-progress`
4. Update Pelvis 3.0 card in `courses.html` to link to `pelvis-3-course.html`
5. Test progress flow locally
