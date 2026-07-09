# Reading Time

Shows a small "N min read" badge in the bottom right corner of article pages. Click the badge to dismiss it for that page.

The estimate counts the words inside the page's `<article>` or `<main>` element (falling back to the whole body) and assumes a reading speed of 220 words per minute. Pages with fewer than 400 words get no badge, which keeps it off search results, dashboards, and other pages that are not articles.

## What it touches

Runs on all http and https pages. It reads the visible text of the page to count words and adds one element to the DOM. It makes no network requests and stores nothing.

## Changelog

- 1.0.0: initial release.
