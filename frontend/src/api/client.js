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

// --- Auth APIs ---
export async function loginUser(credentials) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  if (!res.ok) throw new Error('Login failed');
  return res.json();
}

export async function registerUser(userData) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  if (!res.ok) throw new Error('Registration failed');
  return res.json();
}

export async function fetchCurrentUser() {
  const res = await fetch(`${API_BASE}/auth/me`);
  if (!res.ok) throw new Error('Failed to fetch user session');
  return res.json();
}

// --- Feature 1: Research Gap Intelligence ---
export async function fetchResearchGaps(query = 'Generative AI in Education', limit = 30) {
  const res = await fetch(`${API_BASE}/research-gaps?q=${encodeURIComponent(query)}&limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch research gaps');
  return res.json();
}

// --- Feature 2: Interactive Research Graph (Extended) ---
export async function fetchResearchGraphFiltered(params = {}) {
  const queryParams = new URLSearchParams();
  if (params.q) queryParams.set('q', params.q);
  if (params.year) queryParams.set('year', params.year);
  if (params.topic) queryParams.set('topic', params.topic);
  if (params.author) queryParams.set('author', params.author);
  if (params.institution) queryParams.set('institution', params.institution);
  if (params.limit) queryParams.set('limit', params.limit);
  if (params.relationships && params.relationships.length > 0) {
    params.relationships.forEach(r => queryParams.append('relationships', r));
  }
  const res = await fetch(`${API_BASE}/research-connections?${queryParams.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch research graph');
  return res.json();
}

export async function fetchGraphExpanded(nodeId, nodeType = 'Paper', limit = 8) {
  const res = await fetch(`${API_BASE}/research-connections/expand?nodeId=${encodeURIComponent(nodeId)}&nodeType=${encodeURIComponent(nodeType)}&limit=${limit}`);
  if (!res.ok) throw new Error('Failed to expand graph node');
  return res.json();
}

// --- Feature 3: Paper Comparison Lab ---
export async function comparePapers(paperIds = []) {
  const res = await fetch(`${API_BASE}/paper-comparison`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paperIds })
  });
  if (!res.ok) throw new Error('Failed to compare papers');
  return res.json();
}

// --- Feature 5: Semantic Search & Recommendations ---
export async function fetchSemanticPapers(query = '', page = 0, size = 10) {
  const res = await fetch(`${API_BASE}/papers/semantic?q=${encodeURIComponent(query)}&page=${page}&size=${size}`);
  if (!res.ok) throw new Error('Failed to run semantic search');
  return res.json();
}
export const fetchSemanticSearch = fetchSemanticPapers;

export async function fetchPaperRecommendations(paperId, limit = 5) {
  const res = await fetch(`${API_BASE}/papers/${encodeURIComponent(paperId)}/recommendations?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch paper recommendations');
  return res.json();
}

// --- Feature 6: Research Workspace ---
export async function fetchWorkspaceProjects() {
  const res = await fetch(`${API_BASE}/workspace/projects`);
  if (!res.ok) throw new Error('Failed to fetch workspace projects');
  return res.json();
}

export async function createWorkspaceProject(data) {
  const res = await fetch(`${API_BASE}/workspace/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create project');
  return res.json();
}

export async function deleteWorkspaceProject(projectId) {
  const res = await fetch(`${API_BASE}/workspace/projects/${encodeURIComponent(projectId)}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete project');
  return res.json();
}

export async function fetchWorkspacePapers(params = {}) {
  const queryParams = new URLSearchParams();
  if (params.collection) queryParams.set('collection', params.collection);
  if (params.projectId) queryParams.set('projectId', params.projectId);
  if (params.status) queryParams.set('status', params.status);
  const res = await fetch(`${API_BASE}/workspace/papers?${queryParams.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch workspace papers');
  return res.json();
}

export async function savePaperToWorkspace(paperId, data = {}) {
  const res = await fetch(`${API_BASE}/workspace/papers/${encodeURIComponent(paperId)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to save paper to workspace');
  return res.json();
}

export async function updatePaperReadingStatus(paperId, data = {}) {
  const res = await fetch(`${API_BASE}/workspace/papers/${encodeURIComponent(paperId)}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update reading status');
  return res.json();
}

export async function removePaperFromWorkspace(paperId) {
  const res = await fetch(`${API_BASE}/workspace/papers/${encodeURIComponent(paperId)}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to remove paper from workspace');
  return res.json();
}

export async function fetchWorkspaceCollections() {
  const res = await fetch(`${API_BASE}/workspace/collections`);
  if (!res.ok) throw new Error('Failed to fetch workspace collections');
  return res.json();
}

export async function fetchSavedSearches() {
  const res = await fetch(`${API_BASE}/workspace/searches`);
  if (!res.ok) throw new Error('Failed to fetch saved searches');
  return res.json();
}

export async function saveSearch(data) {
  const res = await fetch(`${API_BASE}/workspace/searches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to save search');
  return res.json();
}
export const createSavedSearch = saveSearch;

export async function deleteSavedSearch(id) {
  const res = await fetch(`${API_BASE}/workspace/searches/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete search');
  return res.json();
}

export async function fetchSavedComparisons() {
  const res = await fetch(`${API_BASE}/workspace/comparisons`);
  if (!res.ok) throw new Error('Failed to fetch saved comparisons');
  return res.json();
}

export async function saveComparison(data) {
  const res = await fetch(`${API_BASE}/workspace/comparisons`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to save comparison');
  return res.json();
}

export async function deleteSavedComparison(id) {
  const res = await fetch(`${API_BASE}/workspace/comparisons/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete comparison');
  return res.json();
}

export async function fetchSavedGapAnalyses() {
  const res = await fetch(`${API_BASE}/workspace/gap-analyses`);
  if (!res.ok) throw new Error('Failed to fetch saved gap analyses');
  return res.json();
}

export async function saveGapAnalysis(data) {
  const res = await fetch(`${API_BASE}/workspace/gap-analyses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to save gap analysis');
  return res.json();
}

export async function deleteSavedGapAnalysis(id) {
  const res = await fetch(`${API_BASE}/workspace/gap-analyses/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete gap analysis');
  return res.json();
}

export function getWorkspaceBibTeXUrl(collection = '', projectId = '') {
  const q = new URLSearchParams();
  if (collection) q.set('collection', collection);
  if (projectId) q.set('projectId', projectId);
  return `${API_BASE}/workspace/export/bibtex?${q.toString()}`;
}

export function getWorkspaceCsvUrl(collection = '', projectId = '') {
  const q = new URLSearchParams();
  if (collection) q.set('collection', collection);
  if (projectId) q.set('projectId', projectId);
  return `${API_BASE}/workspace/export/csv?${q.toString()}`;
}
