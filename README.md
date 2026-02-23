# AINE project

## Set up

Install deps:

`npm install`

Run dev server:

`npm  run dev`

Run with docker:

`docker compose up -d --build`

Generate coverage report:

`npm run test:coverage`

## Log

Most working code came through creating stories and acceptance criteria via BMAD.

Some refactors were made during the code review step, or ad-hoc sessions with certain BMAD
agents (i.e. the architecture agent). After those ad-hoc sessions, the architecture artifact was
updated to reflect those decisions.

Prompts were best when they were direct, included specific context, and preferred names. For example,
when asking to refactor a chunk of code, I specified the name of the module and/or file path. When I asked for
a class to be created, I gave my ideal class name and included methods I wanted for that class.

The agent went a bit too hard on creating unit tests. A lot of tests were unnecessary. I told it multiple times
that it didn't need to test straightforward data transfer in the repositories. It needed some help to get the
end-to-end tests started. It did not create any during the first epic. I went back and kicked the tires a bit
and was able to get it going. Once some of the e2e tests were made, the agent correctly added them as it developed
the other epics.

Debugging was a mixed bag. Sometimes the agent could work through issues and figure out what config needed to be
changed. Sometimes it would go down a wild path and I had to kill the whole process to stop it. Really wish there was
some kind of "wait" command.

The agent was able to create working code, but did not really use any software design patterns unless I asked it. The
dev agent did recognize what I was trying to do when I asked for certain things, such as repositories, an abstraction
for forms, etc. To get the patterns you want, you must be specific.