/**
 * ExploreHimalaya — Firecrawl Service
 *
 * Uses the Firecrawl API to scrape trek information from external URLs
 * (e.g. operator websites, Nepal tourism pages) and optionally save
 * the parsed data as a draft trek.
 *
 * Docs: https://docs.firecrawl.dev
 */
import axios from 'axios'
import { env } from '../config/env'
import { AppError } from '../utils/errors'
import { logger } from '../lib/logger'
import { prisma } from '../lib/prisma'
import { generateUniqueSlug } from '../utils/slug'
import { Difficulty } from '@prisma/client'

// ─── Firecrawl response types ─────────────────────────────────────────────────

interface FirecrawlScrapeResponse {
  success: boolean
  data: {
    content:  string   // Markdown content
    markdown: string
    html:     string
    metadata: {
      title:       string
      description: string
      ogImage?:    string
      sourceURL:   string
    }
  }
}

// ─── Parsed trek data extracted from scraped content ─────────────────────────

export interface ScrapedTrekData {
  name:         string
  description:  string
  region:       string
  difficulty:   Difficulty
  durationDays: number
  maxAltitude:  number
  distanceKm:   number
  priceUsd:     number
  highlights:   string[]
  includes:     string[]
  excludes:     string[]
  coverImage:   string | null
  sourceUrl:    string
  rawMarkdown:  string
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const firecrawlService = {
  /**
   * Scrape a URL with Firecrawl and return structured trek data.
   */
  async scrapeUrl(url: string): Promise<ScrapedTrekData> {
    if (!env.FIRECRAWL_API_KEY) {
      throw AppError.internal('Firecrawl API key not configured')
    }

    logger.info('Firecrawl: scraping URL', { url })

    let scrapeResponse: FirecrawlScrapeResponse

    try {
      const { data } = await axios.post<FirecrawlScrapeResponse>(
        `${env.FIRECRAWL_BASE_URL}/scrape`,
        {
          url,
          formats:     ['markdown'],
          includeTags: ['h1', 'h2', 'h3', 'p', 'ul', 'li', 'img', 'table'],
          excludeTags: ['nav', 'footer', 'header', 'script', 'style', 'ads'],
          onlyMainContent: true,
        },
        {
          headers: {
            Authorization: `Bearer ${env.FIRECRAWL_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 30_000,
        },
      )
      scrapeResponse = data
    } catch (err) {
      logger.error('Firecrawl scrape failed', { url, err })
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.error ?? err.message
        throw new AppError(`Firecrawl error: ${msg}`, err.response?.status ?? 502)
      }
      throw AppError.internal('Failed to scrape the provided URL')
    }

    if (!scrapeResponse.success) {
      throw AppError.badRequest('Firecrawl could not scrape the provided URL')
    }

    const { content, metadata } = scrapeResponse.data
    logger.info('Firecrawl: scrape successful', { url, contentLength: content.length })

    // Parse the markdown into structured trek data
    const parsed = parseMarkdownToTrek(content, metadata, url)
    return parsed
  },

  /**
   * Scrape a URL and optionally save it as a draft trek.
   */
  async scrapeAndSave(url: string, providerId: string): Promise<{ scraped: ScrapedTrekData; trekId?: string }> {
    const scraped = await this.scrapeUrl(url)

    const slug = await generateUniqueSlug(scraped.name)

    const trek = await prisma.trek.create({
      data: {
        slug,
        name:         scraped.name,
        description:  scraped.description,
        region:       scraped.region,
        difficulty:   scraped.difficulty,
        durationDays: scraped.durationDays,
        maxAltitude:  scraped.maxAltitude,
        distanceKm:   scraped.distanceKm,
        priceUsd:     scraped.priceUsd,
        highlights:   scraped.highlights,
        includes:     scraped.includes,
        excludes:     scraped.excludes,
        coverImage:   scraped.coverImage,
        sourceUrl:    url,
        isPublished:  false, // always draft on scrape
        providerId,
      },
      select: { id: true, slug: true, name: true },
    })

    logger.info('Firecrawl: saved scraped trek as draft', { trekId: trek.id, url })
    return { scraped, trekId: trek.id }
  },
}

// ─── Markdown → Trek parser ───────────────────────────────────────────────────
// NOTE: This is a best-effort heuristic parser.
// For production, replace with an LLM extraction call.

function parseMarkdownToTrek(
  markdown: string,
  metadata: FirecrawlScrapeResponse['data']['metadata'],
  sourceUrl: string,
): ScrapedTrekData {
  const lower = markdown.toLowerCase()

  // Extract name from page title or first H1
  const h1Match = markdown.match(/^#\s+(.+)$/m)
  const name = h1Match?.[1]?.trim() ?? metadata.title ?? 'Untitled Trek'

  // Region heuristic
  const regionKeywords: Record<string, string> = {
    khumbu: 'Khumbu', everest: 'Khumbu', annapurna: 'Annapurna',
    langtang: 'Langtang', manaslu: 'Manaslu', mustang: 'Mustang',
    dolpo: 'Dolpo', kangchenjunga: 'Kangchenjunga', makalu: 'Makalu',
  }
  const region =
    Object.entries(regionKeywords).find(([kw]) => lower.includes(kw))?.[1] ?? 'Nepal'

  // Difficulty heuristic
  const difficulty: Difficulty =
    lower.includes('extreme') || lower.includes('strenuous')  ? Difficulty.EXTREME    :
    lower.includes('challeng')                                 ? Difficulty.CHALLENGING :
    lower.includes('moderate')                                 ? Difficulty.MODERATE    :
                                                                 Difficulty.MODERATE

  // Duration — look for "X days" or "X-day"
  const durationMatch = markdown.match(/(\d+)[\s-]day/i)
  const durationDays  = durationMatch ? parseInt(durationMatch[1], 10) : 14

  // Altitude — look for metres/meters
  const altMatch    = markdown.match(/(\d[\d,]+)\s*(m|metres?|meters?)\b/gi)
  const altNumbers  = altMatch?.map((m) => parseInt(m.replace(/[^\d]/g, ''), 10)) ?? []
  const maxAltitude = altNumbers.length ? Math.max(...altNumbers) : 5000

  // Distance
  const distMatch  = markdown.match(/(\d+)\s*km/i)
  const distanceKm = distMatch ? parseInt(distMatch[1], 10) : 100

  // Price — USD
  const priceMatch = markdown.match(/\$\s*([\d,]+)/i)
  const priceUsd   = priceMatch ? parseInt(priceMatch[1].replace(/,/g, ''), 10) : 1500

  // Description — first substantial paragraph
  const paragraphs = markdown
    .split('\n\n')
    .map((p) => p.replace(/#+\s*/g, '').trim())
    .filter((p) => p.length > 100 && !p.startsWith('!') && !p.startsWith('|'))
  const description = paragraphs[0] ?? metadata.description ?? name

  // Highlights — bullet points near "highlight" / "feature"
  const highlights = extractListItems(markdown, /highlight|feature|why/i).slice(0, 8)

  // Includes / excludes
  const includes = extractListItems(markdown, /include|what.{0,20}include/i).slice(0, 12)
  const excludes = extractListItems(markdown, /exclud|not include/i).slice(0, 8)

  // Cover image
  const imgMatch  = markdown.match(/!\[.*?\]\((https?:\/\/[^)]+)\)/)
  const coverImage = imgMatch?.[1] ?? metadata.ogImage ?? null

  return {
    name, description, region, difficulty, durationDays, maxAltitude,
    distanceKm, priceUsd, highlights, includes, excludes, coverImage, sourceUrl,
    rawMarkdown: markdown,
  }
}

/**
 * Extract bullet list items near a heading matching `pattern`.
 */
function extractListItems(markdown: string, pattern: RegExp): string[] {
  const lines   = markdown.split('\n')
  const results: string[] = []
  let capture   = false

  for (const line of lines) {
    const trimmed = line.trim()
    if (pattern.test(trimmed) && (trimmed.startsWith('#') || trimmed.endsWith(':'))) {
      capture = true
      continue
    }
    if (capture) {
      if (/^#{1,3}\s/.test(trimmed) && results.length > 0) break // next section
      const match = trimmed.match(/^[-*•]\s+(.+)$/)
      if (match) results.push(match[1].trim())
    }
  }

  return results
}
