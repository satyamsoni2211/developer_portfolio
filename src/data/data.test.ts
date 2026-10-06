import { describe, expect, test } from 'vitest'
import { TIPS } from '@/guide/tips'
import { education } from './education'
import { experience } from './experience'
import { profile } from './profile'
import { projects } from './projects'
import { SECTION_IDS } from './sections'
import { skillCategories } from './skills'
import { isUpcoming, talks } from './talks'

describe('content data', () => {
  test('has 9 projects in the agreed order with unique slugs', () => {
    expect(projects.map((p) => p.slug)).toEqual([
      'defect-detection', 'stryve', 'crickbuzz', 'fusion', 'html-parser',
      'utility-framework', 'vendor-data-ingest', 'tool-suite', 'certificate-renewal',
    ])
  })

  test('first three projects are collaborations, the rest enterprise', () => {
    expect(projects.slice(0, 3).every((p) => p.kind === 'collaboration')).toBe(true)
    expect(projects.slice(3).every((p) => p.kind === 'enterprise' && p.company)).toBe(true)
  })

  test('every project has cover, tech, tagline and at least one metric', () => {
    for (const p of projects) {
      expect(p.cover, p.slug).toBeTruthy()
      expect(p.tech.length, p.slug).toBeGreaterThan(0)
      expect(p.tagline.length, p.slug).toBeGreaterThan(10)
      expect(p.metrics.length, p.slug).toBeGreaterThan(0)
    }
  })

  test('architecture edges reference existing nodes', () => {
    for (const p of projects) {
      if (!p.architecture) continue
      const ids = new Set(p.architecture.nodes.map((n) => n.id))
      for (const e of p.architecture.edges) {
        expect(ids.has(e.from), `${p.slug}: ${e.from}`).toBe(true)
        expect(ids.has(e.to), `${p.slug}: ${e.to}`).toBe(true)
      }
    }
  })

  test('collaboration projects carry their services and models', () => {
    const bySlug = Object.fromEntries(projects.map((p) => [p.slug, p]))
    expect(bySlug['defect-detection'].services.map((s) => s.name)).toEqual(['Camera Service', 'Defect Backend', 'Defect Dashboard'])
    expect(bySlug['stryve'].services.map((s) => s.name)).toEqual(['Stryve Backend', 'Pose Extraction Service'])
    expect(bySlug['crickbuzz'].services.map((s) => s.name)).toEqual(['Extraction Service'])
    expect(bySlug['defect-detection'].models).toEqual(['YOLO11s'])
    expect(bySlug['crickbuzz'].models).toEqual(['YOLO26 (custom-trained)'])
  })

  test('6 jobs newest first, 8 skill categories, education present', () => {
    expect(experience.map((j) => j.company)).toEqual([
      'EPAM India', 'SenecaGlobal Solutions Pvt Ltd.', 'HSBC Software Development (India) Pvt. Ltd.',
      'Infosys Ltd', 'Amdocs Development Centre India LLP', 'Gemini Solutions Pvt Ltd.',
    ])
    expect(experience[1].period.endsWith('Sep 2025')).toBe(true)
    expect(skillCategories).toHaveLength(8)
    expect(education.school).toBe('Chamelidevi School of Engineering')
  })

  test('copy says 10+ years and never 9+', () => {
    const text = JSON.stringify({ profile, experience, projects })
    expect(text).toContain('10+ years')
    expect(text).not.toContain('9+')
  })

  test('talks: 4 workshops, newest first, https links', () => {
    expect(talks).toHaveLength(4)
    const years = talks.map((t) => t.year)
    expect(years).toEqual([...years].sort((a, b) => b - a))
    expect(talks.every((t) => t.url.startsWith('https://'))).toBe(true)
    expect(talks.every((t) => t.kind === 'Workshop')).toBe(true)
  })

  test('section ids are fixed', () => {
    expect(SECTION_IDS).toEqual([
      'hero', 'about', 'experience', 'projects', 'opensource', 'writing',
      'speaking', 'recommendations', 'skills', 'education', 'contact',
    ])
  })

  test('a dated talk is upcoming until its day has passed', () => {
    const hk = talks[0]
    expect(hk.date).toBe('2026-11-14')
    expect(isUpcoming(hk, new Date('2026-10-05T12:00:00Z'))).toBe(true)
    expect(isUpcoming(hk, new Date('2026-11-14T08:00:00Z'))).toBe(true)
    expect(isUpcoming(hk, new Date('2026-11-16T00:00:00Z'))).toBe(false)
    expect(isUpcoming(talks[1], new Date('2020-01-01T00:00:00Z'))).toBe(false)
  })

  test('website is the primary domain', () => {
    expect(profile.website).toBe('https://www.satyamsoni.com')
  })

  test('the word freelance appears nowhere in the content', () => {
    expect(JSON.stringify({ profile, experience, projects, TIPS })).not.toMatch(/freelanc/i)
  })

  test('collaboration roles use the agreed titles', () => {
    expect(projects.slice(0, 3).map((p) => p.role)).toEqual(['Technical partner', 'Lead engineer', 'Technical partner'])
  })
})
