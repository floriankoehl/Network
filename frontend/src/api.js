const CACHE_PREFIX = 'ndash_off2_'
const CACHE_TTL    = 24 * 60 * 60 * 1000
const FIELDS       = 'id,product_name,image_front_small_url,image_front_thumb_url,nutriments,categories_tags'

function getCached(key) {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL) { localStorage.removeItem(CACHE_PREFIX + key); return null }
    return data
  } catch { return null }
}

function setCache(key, data) {
  try { localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ data, ts: Date.now() })) } catch {}
}

const HEADERS = { 'User-Agent': 'NutriCompare/1.0' }

function mapProduct(p) {
  const n    = p.nutriments ?? {}
  const kcal = n['energy-kcal_100g'] ?? (n['energy_100g'] ? n['energy_100g'] / 4.184 : 0)
  // OFF often stores salt rather than sodium; convert: sodium = salt / 2.5
  const sodiumMg = n['sodium_100g'] != null
    ? n['sodium_100g'] * 1000
    : (n['salt_100g'] != null ? (n['salt_100g'] / 2.5) * 1000 : 0)

  return {
    fdcId:        String(p.id ?? p._id),
    description:  p.product_name || 'Unknown product',
    foodCategory: p.categories_tags?.[0]?.replace('en:', '').replace(/-/g, ' ') ?? '',
    imageUrl:     p.image_front_small_url ?? p.image_front_thumb_url ?? null,
    dataType:     'OpenFoodFacts',
    foodNutrients: [
      { nutrientId: 1008, amount: kcal                                    },
      { nutrientId: 1003, amount: n['proteins_100g']          ?? 0        },
      { nutrientId: 1004, amount: n['fat_100g']               ?? 0        },
      { nutrientId: 1005, amount: n['carbohydrates_100g']     ?? 0        },
      { nutrientId: 1079, amount: n['fiber_100g']             ?? 0        },
      { nutrientId: 2000, amount: n['sugars_100g']            ?? 0        },
      { nutrientId: 1093, amount: sodiumMg                                },
      { nutrientId: 1087, amount: (n['calcium_100g']     ?? 0) * 1000    },
      { nutrientId: 1089, amount: (n['iron_100g']        ?? 0) * 1000    },
      { nutrientId: 1092, amount: (n['potassium_100g']   ?? 0) * 1000    },
      { nutrientId: 1106, amount: n['vitamin-a_100g']         ?? 0        }, // µg
      { nutrientId: 1162, amount: n['vitamin-c_100g']         ?? 0        }, // mg
    ],
  }
}

function hasUsableData(p) {
  if (!p.product_name) return false
  const n = p.nutriments ?? {}
  return n['energy-kcal_100g'] != null || n['energy_100g'] != null || n['proteins_100g'] != null
}

const PROCESSED_CATS = [
  'biscuits', 'snacks', 'chocolates', 'candies', 'cakes', 'cookies',
  'chips', 'crisps', 'sweets', 'confectioneries', 'desserts',
]

function rankProducts(products, query) {
  const q = query.toLowerCase().trim()

  function score(p) {
    const name  = (p.product_name || '').toLowerCase()
    const words = name.split(/\s+/)
    const cats  = (p.categories_tags ?? []).map(t => t.replace('en:', '').replace(/-/g, ' '))
    let s = 0

    if (q) {
      if (name === q)                                                 s += 100
      else if (words[0] === q || words[0] === q + 's')               s += 75
      else if (name.startsWith(q + ' ') || name.startsWith(q + ',')) s += 55
      else if (name.startsWith(q))                                   s += 35
      else if (name.includes(' ' + q) || name.includes(q + ' '))    s += 15
    }

    if (name.length <= 20) s += 12
    else if (name.length > 60) s -= 12

    if (p._fromCategory) s += 60

    if (PROCESSED_CATS.some(bad => cats.some(c => c.includes(bad)))) s -= 30

    const n = p.nutriments ?? {}
    if (n['energy-kcal_100g'] != null || n['energy_100g'] != null) s += 8
    if (n['proteins_100g']      != null) s += 4
    if (n['fat_100g']           != null) s += 2
    if (n['carbohydrates_100g'] != null) s += 2

    if (p.image_front_small_url || p.image_front_thumb_url) s += 18

    const nonAscii = (name.match(/[^\x00-\x7F]/g) || []).length
    if (nonAscii > 2) s -= 20

    return s
  }

  return [...products].sort((a, b) => score(b) - score(a))
}

// Tries to find products under an OFF category derived from the query text.
// e.g. "apple" → en:apples → actual apple products, ranked above text results.
async function fetchCategoryProducts(query) {
  if (!query) return []
  const q          = query.toLowerCase().trim().replace(/\s+/g, '-')
  const candidates = [...new Set([`en:${q}s`, `en:${q}`, `en:${q}es`])]

  for (const tag of candidates) {
    try {
      const url = `https://world.openfoodfacts.org/api/v2/search` +
        `?categories_tags=${encodeURIComponent(tag)}&fields=${FIELDS}&page_size=24`
      const res = await fetch(url, { headers: HEADERS })
      if (!res.ok) continue
      const data = await res.json()
      const products = (data.products ?? []).filter(hasUsableData)
      if (products.length >= 2) return products.map(p => ({ ...p, _fromCategory: true }))
    } catch { /* try next */ }
  }
  return []
}

async function fetchTextProducts(query) {
  if (!query) return []
  try {
    const url = `https://world.openfoodfacts.org/api/v2/search` +
      `?search_terms=${encodeURIComponent(query)}&page_size=40&fields=${FIELDS}`
    const res = await fetch(url, { headers: HEADERS })
    if (!res.ok) return []
    const data = await res.json()
    return (data.products ?? []).filter(hasUsableData)
  } catch { return [] }
}

// Returns all ranked results (not sliced) — pagination is handled by the hook.
export async function searchFoods(query) {
  if (!query) return []

  const cacheKey = 'search__' + query.trim().toLowerCase()
  const cached = getCached(cacheKey)
  if (cached) return cached

  const [catProducts, textProducts] = await Promise.all([
    fetchCategoryProducts(query),
    fetchTextProducts(query),
  ])

  if (catProducts.length === 0 && textProducts.length === 0) {
    throw new Error('Open Food Facts returned no results — the API may be temporarily unavailable. Try again in a moment.')
  }

  const seenIds = new Set(catProducts.map(p => String(p.id ?? p._id)))
  const merged  = [...catProducts, ...textProducts.filter(p => !seenIds.has(String(p.id ?? p._id)))]
  const products = rankProducts(merged, query).map(mapProduct)

  setCache(cacheKey, products)
  return products
}

export async function getFoodDetail(fdcId) {
  const cached = getCached('detail_' + fdcId)
  if (cached) return cached

  const res = await fetch(
    `https://world.openfoodfacts.org/api/v2/product/${fdcId}.json?fields=${FIELDS}`,
    { headers: HEADERS }
  )
  if (!res.ok) throw new Error(`Product fetch failed (HTTP ${res.status})`)
  const data = await res.json()
  if (data.status !== 1 || !data.product) throw new Error('Product not found')

  const result = mapProduct(data.product)
  setCache('detail_' + fdcId, result)
  return result
}
