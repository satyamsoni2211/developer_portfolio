import type { Post } from './types'

const post = (platform: Post['platform'], published: string, title: string, blurb: string, url: string): Post => ({
  title,
  blurb,
  platform,
  published,
  year: Number(published.slice(0, 4)),
  url,
})

export const posts: Post[] = [
  post(
    'LinkedIn',
    '2026-07-22',
    'How I Turned Obsidian Into a Hiring Second Brain',
    'How an Obsidian vault screens and assesses candidates, replacing the folder of PDFs and the stale spreadsheet.',
    'https://www.linkedin.com/pulse/how-i-turned-obsidian-hiring-second-brain-satyam-soni-qmwac/',
  ),
  post(
    'dev.to',
    '2026-06-08',
    "What asyncio.run_in_executor doesn't tell you (and how I fixed it)",
    'Building async_patcher, a zero-dependency library that adds to_process() to asyncio for CPU-bound work.',
    'https://dev.to/satyamsoni2211/what-asyncioruninexecutor-doesnt-tell-you-and-how-i-fixed-it-3hc5',
  ),
  post(
    'dev.to',
    '2026-05-18',
    'Stop loading tables you never use: lazy-alchemy v2 for SQLAlchemy 2, async, Pydantic, and SQLModel',
    'lazy-alchemy v2 defers SQLAlchemy table reflection to first access to cut application startup time.',
    'https://dev.to/satyamsoni2211/stop-loading-tables-you-never-use-lazy-alchemy-v2-for-sqlalchemy-2-async-pydantic-and-sqlmodel-55o5',
  ),
  post(
    'dev.to',
    '2026-05-11',
    'I Built a One-Command macOS Terminal Setup — Ghostty + Zsh + 30 Modern CLI Tools',
    'dev-accelerator sets up Ghostty, Zsh and a curated command-line toolchain with a single command.',
    'https://dev.to/satyamsoni2211/i-built-a-one-command-macos-terminal-setup-ghostty-zsh-30-modern-cli-tools-43f5',
  ),
  post(
    'X',
    '2026-02-17',
    'From Vanilla to God Mode: Build the Ultimate macOS Developer Terminal in Minutes',
    'One command, one script: why I built dev-accelerator and what it installs.',
    'https://x.com/_satyamsoni_/status/2023652639779807338',
  ),
  post(
    'dev.to',
    '2025-06-10',
    "A Developer's Guide to Mastering AI with GitHub Models: Your Free Sandbox for Innovation",
    'Using GitHub Models as a free sandbox for experimenting with AI models.',
    'https://dev.to/satyamsoni2211/a-developers-guide-to-mastering-ai-with-github-models-your-free-sandbox-for-innovation-3mni',
  ),
  post(
    'dev.to',
    '2024-04-12',
    'Introducing EventSail: A Python Library for Event-driven Programming',
    'A small library for emitting and handling events in a decoupled way.',
    'https://dev.to/satyamsoni2211/introducing-eventsail-a-python-library-for-event-driven-programming-12fo',
  ),
  post(
    'dev.to',
    '2022-07-22',
    'Extending Python Logger for mailing Exceptions',
    "Extending Python's logging so that exceptions arrive in your mailbox.",
    'https://dev.to/satyamsoni2211/extending-python-logger-for-mailing-exceptions-2hfj',
  ),
]
