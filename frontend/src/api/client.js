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
