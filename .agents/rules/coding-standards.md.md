---
trigger: always_on
---

# Orbit AI - Project Coding Standards

## Project Overview

Orbit AI is a modern AI-powered SaaS application built with Next.js App Router, TypeScript, Prisma, PostgreSQL, Auth.js, Tailwind CSS, and shadcn/ui.

Every implementation must prioritize scalability, maintainability, performance, security, and an excellent user experience.

---

# Primary Objective

Every change should:

* Feel native to the existing project.
* Preserve consistency.
* Avoid unnecessary complexity.
* Improve code quality whenever possible.

---

# Before Writing Code

Always perform these steps first:

1. Read the entire feature flow.
2. Inspect related files.
3. Search for existing implementations.
4. Understand the current architecture.
5. Identify the root cause.
6. Propose the smallest correct solution.
7. Only then implement.

Never guess.

Never invent files, APIs, or database fields.

---

# Tech Stack

Always follow these technologies:

* Next.js App Router
* TypeScript
* Prisma ORM
* PostgreSQL
* Auth.js
* Tailwind CSS
* shadcn/ui
* React Server Components
* Server Actions where appropriate

Do not introduce alternative frameworks unless explicitly requested.

---

# Project Structure

Respect the existing folder structure.

Prefer reusing:

* components
* hooks
* utilities
* services
* lib
* types
* constants
* actions

Never duplicate functionality.

---

# TypeScript Rules

Always:

* Use strict typing.
* Create reusable interfaces.
* Prefer type inference where appropriate.
* Use enums only when beneficial.

Never use:

* any
* @ts-ignore
* @ts-nocheck

Fix the actual type issue instead.

---

# React Rules

Prefer:

* Server Components
* Functional Components
* Composition over inheritance
* Reusable components

Avoid:

* unnecessary Client Components
* deeply nested props
* prop drilling when existing context/store solves it

---

# Next.js Rules

Always:

* Use App Router conventions.
* Use Server Actions when appropriate.
* Keep secrets on the server.
* Optimize images.
* Lazy-load heavy components.
* Use loading.tsx and error.tsx where appropriate.
* Use route handlers correctly.

Never expose server-only logic to the client.

---

# Authentication

Always verify:

* authenticated user
* session validity
* permissions
* ownership

Never expose:

* passwords
* tokens
* secrets
* internal identifiers unnecessarily

---

# Prisma

Before editing database logic:

Inspect:

* schema.prisma
* migrations
* existing relations

Always:

* use transactions when multiple writes occur
* avoid N+1 queries
* use select/include appropriately
* validate database input

Never:

* delete migrations
* manually modify generated Prisma client
* create duplicate models

---

# API Standards

Every API should:

* validate input
* return consistent responses
* return appropriate HTTP status codes
* sanitize outputs
* handle errors gracefully

Never expose stack traces.

---

# UI Standards

Follow existing:

* spacing
* typography
* colors
* border radius
* animations
* responsive behavior

Do not introduce inconsistent UI.

Always match the existing design language.

---

# Tailwind CSS

Prefer utility classes.

Avoid excessive class duplication.

Extract reusable UI when repetition appears.

Maintain consistent spacing and sizing.

---

# Forms

Every form must include:

* client validation
* server validation
* loading state
* success state
* error handling
* accessible labels
* disabled submit during requests

---

# Error Handling

Never silently ignore errors.

Always:

* catch expected failures
* log useful information
* return meaningful messages
* preserve user experience

---

# Performance

Prefer:

* pagination
* caching
* optimized Prisma queries
* lazy loading
* memoization when beneficial
* code splitting

Avoid unnecessary renders.

---

# Accessibility

Ensure:

* semantic HTML
* keyboard accessibility
* proper labels
* focus management
* sufficient contrast

---

# Security

Never:

* hardcode secrets
* trust client input
* bypass authentication
* weaken authorization

Always sanitize and validate user input.

---

# Code Quality

Every file should:

* have a single responsibility
* remain readable
* be easy to maintain
* avoid duplicated logic

Prefer small reusable functions.

---

# Git Hygiene

Only modify files relevant to the task.

Never perform unrelated refactors.

Never remove working functionality unless required.

---

# Before Completing Any Task

Verify:

* No TypeScript errors
* No lint errors
* No unused imports
* No unused variables
* No duplicate logic
* No broken routes
* No broken authentication
* No Prisma errors
* No console errors
* No hydration issues
* No accessibility regressions

---

# Required Response Format

For every task, provide:

1. Problem analysis
2. Root cause
3. Implementation plan
4. Files modified
5. Summary of changes
6. Risks or edge cases
7. Suggestions for future improvements (if applicable)

---

# Golden Rules

* Think before coding.
* Read before editing.
* Reuse before creating.
* Validate before saving.
* Test mentally before finishing.
* Deliver production-ready code.
* Never sacrifice maintainability for speed.
* Make the smallest correct change that solves the problem completely.
