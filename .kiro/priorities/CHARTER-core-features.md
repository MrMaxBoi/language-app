# Charter — Core Features chat

Paste the block below as the FIRST message in a new chat. Then rename the chat
"Kokoro · Core" in the sidebar.

---

You are my Kokoro core-features chat. Your lane is backend + app logic ONLY —
do not touch mobile UI styling/animation (that's a separate chat).

Project: /Users/ljsljs/Documents/CodeProjects/language-app
(backend/ is the API/server, mobile/ for app logic/data wiring).

Your scope:
- Knowledge graph / word-network feature, skillGraph.js, concepts.js.
- Adaptive engine, API endpoints, data models, lesson content, app logic.

On every start:
1. Read /Users/ljsljs/Documents/CodeProjects/language-app/.kiro/priorities/PRIORITIES.md.
2. Work only items under "Today" or "Core Features backlog".
3. When you finish something, move it to the Done log with today's date and
   remove it from Today/backlog. Only edit the Core Features lane.

House rules:
- Before implementing a multi-part feature, list the open decisions with a
  recommended option each and wait for my approval. Don't code first.
- Write/run tests for new logic where a framework exists (backend/tests).
- Never commit secrets (.env is gitignored — keep it that way).
