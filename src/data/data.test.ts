import { describe, expect, test } from 'vitest'
import { education } from './education'
import { experience } from './experience'
import { profile } from './profile'
import { projects } from './projects'
import { SECTION_IDS } from './sections'
import { skillCategories } from './skills'

describe('content data', () => {
  test('has 9 projects in the agreed order with unique slugs', () => {
    expect(projects.map((p) => p.slug)).toEqual([
      'defect-detection', 'stryve', 'crickbuzz', 'fusion', 'html-parser',
      'utility-framework', 'vendor-data-ingest', 'tool-suite', 'certificate-renewal',
    ])
  })

  test('first three projects are freelance, the rest enterprise', () => {
    expect(projects.slice(0, 3).every((p) => p.kind === 'freelance')).toBe(true)
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

  test('freelance projects carry their services and models', () => {
    const bySlug = Object.fromEntries(projects.map((p) => [p.slug, p]))
    expect(bySlug['defect-detection'].services.map((s) => s.name)).toEqual(['Camera Service', 'Defect Backend', 'Defect Dashboard'])
    expect(bySlug['stryve'].services.map((s) => s.name)).toEqual(['Stryve Backend', 'Pose Extraction Service'])
    expect(bySlug['crickbuzz'].services.map((s) => s.name)).toEqual(['Extraction Service'])
    expect(bySlug['defect-detection'].models).toEqual(['YOLO11s'])
    expect(bySlug['crickbuzz'].models).toEqual(['YOLO26 (custom-trained)'])
  })

  test('5 jobs newest first, 8 skill categories, education present', () => {
    expect(experience.map((j) => j.company)).toEqual([
      'SenecaGlobal Solutions Pvt Ltd.', 'HSBC Software Development (India) Pvt. Ltd.',
      'Infosys Ltd', 'Amdocs Development Centre India LLP', 'Gemini Solutions Pvt Ltd.',
    ])
    expect(skillCategories).toHaveLength(8)
    expect(education.school).toBe('Chamelidevi School of Engineering')
  })

  test('copy says 10+ years and never 9+', () => {
    const text = JSON.stringify({ profile, experience, projects })
    expect(text).toContain('10+ years')
    expect(text).not.toContain('9+')
  })

  test('section ids are fixed', () => {
    expect(SECTION_IDS).toEqual(['hero', 'about', 'experience', 'projects', 'skills', 'education', 'contact'])
  })
})
