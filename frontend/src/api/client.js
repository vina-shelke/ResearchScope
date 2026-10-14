const getApiBase = () => {
  if (typeof window !== 'undefined') {
    if (window.location.port === '8081' || window.location.port === '') {
      return '/api';
    }
  }
  return 'http://localhost:8081/api';
};

const API_BASE = getApiBase();

export async function fetchLandscape(query = '') {
  const url = query ? `${API_BASE}/research-landscape?q=${encodeURIComponent(query)}` : `${API_BASE}/research-landscape`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch research landscape');
  return res.json();
}

export async function fetchPapers(params = {}) {
  const queryParams = new URLSearchParams();
  if (params.q) queryParams.set('q', params.q);
  if (params.year) queryParams.set('year', params.year);
  if (params.source) queryParams.set('source', params.source);
  if (params.minCitations) queryParams.set('minCitations', params.minCitations);
  if (params.isOpenAccess !== undefined && params.isOpenAccess !== null && params.isOpenAccess !== '') {
    queryParams.set('isOpenAccess', params.isOpenAccess);
  }
  if (params.paperType) queryParams.set('paperType', params.paperType);
  if (params.author) queryParams.set('author', params.author);
  if (params.institution) queryParams.set('institution', params.institution);
  if (params.sortBy) queryParams.set('sortBy', params.sortBy);
  if (params.sortDir) queryParams.set('sortDir', params.sortDir);
  if (params.page !== undefined) queryParams.set('page', params.page);
  if (params.size !== undefined) queryParams.set('size', params.size);

  const res = await fetch(`${API_BASE}/papers?${queryParams.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch papers');
  return res.json();
}

export async function fetchPaperById(id) {
  const res = await fetch(`${API_BASE}/papers/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error('Failed to fetch paper details');
  return res.json();
}

export async function fetchPaperReferences(id) {
  const res = await fetch(`${API_BASE}/papers/${encodeURIComponent(id)}/references`);
  if (!res.ok) throw new Error('Failed to fetch paper references');
  return res.json();
}

export async function fetchAuthors(params = {}) {
  const queryParams = new URLSearchParams();
  if (params.q) queryParams.set('q', params.q);
  if (params.page !== undefined) queryParams.set('page', params.page);
  if (params.size !== undefined) queryParams.set('size', params.size);

  const res = await fetch(`${API_BASE}/authors?${queryParams.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch authors');
  return res.json();
}

export async function fetchAuthorById(id) {
  const res = await fetch(`${API_BASE}/authors/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error('Failed to fetch author details');
  return res.json();
}

export async function fetchAuthorPapers(id) {
  const res = await fetch(`${API_BASE}/authors/${encodeURIComponent(id)}/papers`);
  if (!res.ok) throw new Error('Failed to fetch author papers');
  return res.json();
}

export async function fetchInstitutions(params = {}) {
  const queryParams = new URLSearchParams();
  if (params.q) queryParams.set('q', params.q);
  if (params.page !== undefined) queryParams.set('page', params.page);
  if (params.size !== undefined) queryParams.set('size', params.size);

  const res = await fetch(`${API_BASE}/institutions?${queryParams.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch institutions');
  return res.json();
}

export async function fetchInstitutionById(id) {
  const res = await fetch(`${API_BASE}/institutions/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error('Failed to fetch institution details');
  return res.json();
}

export async function fetchTopics(params = {}) {
  const queryParams = new URLSearchParams();
  if (params.q) queryParams.set('q', params.q);
  if (params.page !== undefined) queryParams.set('page', params.page);
  if (params.size !== undefined) queryParams.set('size', params.size);

  const res = await fetch(`${API_BASE}/topics?${queryParams.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch topics');
  return res.json();
}

export async function fetchTopicPapers(id) {
  const res = await fetch(`${API_BASE}/topics/${encodeURIComponent(id)}/papers`);
  if (!res.ok) throw new Error('Failed to fetch topic papers');
  return res.json();
}

export async function fetchTopicAnalytics(id) {
  const res = await fetch(`${API_BASE}/topics/${encodeURIComponent(id)}/analytics`);
  if (!res.ok) throw new Error('Failed to fetch topic analytics');
  return res.json();
}

export async function fetchTopicTrends(id) {
  const res = await fetch(`${API_BASE}/topics/${encodeURIComponent(id)}/trends`);
  if (!res.ok) throw new Error('Failed to fetch topic trends');
  return res.json();
}

export async function fetchCitationIntelligence() {
  const res = await fetch(`${API_BASE}/citations/intelligence`);
  if (!res.ok) throw new Error('Failed to fetch citation intelligence');
  return res.json();
}

export async function fetchResearchGraph(query = '') {
  const url = query ? `${API_BASE}/research-connections?q=${encodeURIComponent(query)}` : `${API_BASE}/research-connections`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch research graph');
  return res.json();
}

// Saved Papers (Bookmarks & Collections)
export async function fetchSavedPapers(collection = '') {
  const url = collection ? `${API_BASE}/saved-papers?collection=${encodeURIComponent(collection)}` : `${API_BASE}/saved-papers`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch saved papers');
  return res.json();
}

export async function fetchSavedCollections() {
  const res = await fetch(`${API_BASE}/saved-papers/collections`);
  if (!res.ok) throw new Error('Failed to fetch saved collections');
  return res.json();
}

export async function savePaper(paperId, data = {}) {
  const res = await fetch(`${API_BASE}/saved-papers/${encodeURIComponent(paperId)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to save paper');
  return res.json();
}

export async function removeSavedPaper(paperId) {
  const res = await fetch(`${API_BASE}/saved-papers/${encodeURIComponent(paperId)}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to remove paper');
  return res.json();
}

// Export URLs
export function getPaperBibTeXUrl(paperId) {
  return `${API_BASE}/papers/${encodeURIComponent(paperId)}/export/bibtex`;
}

export function getPapersCsvExportUrl(params = {}) {
  const queryParams = new URLSearchParams();
  if (params.q) queryParams.set('q', params.q);
  if (params.year) queryParams.set('year', params.year);
  if (params.source) queryParams.set('source', params.source);
  if (params.minCitations) queryParams.set('minCitations', params.minCitations);
  if (params.isOpenAccess !== undefined && params.isOpenAccess !== null && params.isOpenAccess !== '') {
    queryParams.set('isOpenAccess', params.isOpenAccess);
  }
  if (params.paperType) queryParams.set('paperType', params.paperType);
  if (params.author) queryParams.set('author', params.author);
  if (params.institution) queryParams.set('institution', params.institution);
  return `${API_BASE}/papers/export/csv?${queryParams.toString()}`;
}

export function getPapersBibTeXExportUrl(params = {}) {
  const queryParams = new URLSearchParams();
  if (params.q) queryParams.set('q', params.q);
  if (params.year) queryParams.set('year', params.year);
  if (params.source) queryParams.set('source', params.source);
  if (params.minCitations) queryParams.set('minCitations', params.minCitations);
  if (params.isOpenAccess !== undefined && params.isOpenAccess !== null && params.isOpenAccess !== '') {
    queryParams.set('isOpenAccess', params.isOpenAccess);
  }
  if (params.paperType) queryParams.set('paperType', params.paperType);
  if (params.author) queryParams.set('author', params.author);
  if (params.institution) queryParams.set('institution', params.institution);
  return `${API_BASE}/papers/export/bibtex?${queryParams.toString()}`;
}

export function getSavedPapersCsvUrl(collection = '') {
  return collection
    ? `${API_BASE}/saved-papers/export/csv?collection=${encodeURIComponent(collection)}`
    : `${API_BASE}/saved-papers/export/csv`;
}

export function getSavedPapersBibTeXUrl(collection = '') {
  return collection
    ? `${API_BASE}/saved-papers/export/bibtex?collection=${encodeURIComponent(collection)}`
    : `${API_BASE}/saved-papers/export/bibtex`;
}
