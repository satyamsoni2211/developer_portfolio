import type { OpenSourcePackage } from './types'

export const pypiProfile = 'https://pypi.org/user/satyamsoni2211/'

const pkg = (name: string, released: string, summary: string, repo?: string): OpenSourcePackage => ({
  name,
  summary,
  released,
  year: Number(released.slice(0, 4)),
  pypi: `https://pypi.org/project/${name}/`,
  repo: repo && `https://github.com/satyamsoni2211/${repo}`,
})

export const packages: OpenSourcePackage[] = [
  pkg('async-patcher', '2026-06-07', 'Patches asyncio to add to_process: offload CPU-bound callables to a separate process and get back an awaitable ProcessTask with full metadata.', 'async_patcher'),
  pkg('lazy-alchemy', '2026-05-20', 'Lazy-load SQLAlchemy table metadata on demand, with full SQLAlchemy 2, async and Pydantic support.', 'lazy_alchemy'),
  pkg('fastapi-proxykit', '2026-03-19', 'A production-ready FastAPI plugin for transparent HTTP proxying with per-route circuit breakers and OpenTelemetry observability.', 'fastapi_proxykit'),
  pkg('eventsail', '2024-04-17', 'A library for emitting events and handling them in a decoupled way.', 'eventsail'),
  pkg('flask-dantic', '2023-07-02', 'Validate Flask request models and serialise database objects using Pydantic models.'),
  pkg('lazy-env-configurator', '2023-04-27', 'Dynamic config class creation from environment variables.', 'lazy_env_configurator'),
  pkg('codebuild-ci', '2023-04-20', 'Command-line utility to trigger an AWS CodeBuild pipeline and wait for it to complete.', 'codebuild_ci'),
  pkg('py-lambda-warmer', '2022-06-14', 'Warmer utility that keeps AWS Lambda functions warm to avoid cold starts.', 'LambdaWarmerPy'),
  pkg('crypto-data-fetcher', '2021-06-04', 'Utilities for fetching crypto coin market data.'),
]
