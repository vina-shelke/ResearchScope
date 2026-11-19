const getApiBase = () => {
  if (typeof window !== 'undefined') {
    if (import.meta.env && import.meta.env.VITE_API_BASE_URL) {
      return import.meta.env.VITE_API_BASE_URL;
    }
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

export function getPaperRisUrl(paperId) {
  return `${API_BASE}/papers/${encodeURIComponent(paperId)}/export/ris`;
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

export function getPapersRisExportUrl(params = {}) {
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
  return `${API_BASE}/papers/export/ris?${queryParams.toString()}`;
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

// --- Auth Session & Token Management ---
export function getStoredAuth() {
  try {
    const raw = localStorage.getItem('researchscope_auth');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse stored auth session:', e);
  }
  return null;
}

export function setStoredAuth(authData) {
  try {
    if (authData) {
      localStorage.setItem('researchscope_auth', JSON.stringify(authData));
    } else {
      localStorage.removeItem('researchscope_auth');
    }
  } catch (e) {
    console.error('Failed to persist auth session:', e);
  }
}

export function clearStoredAuth() {
  try {
    localStorage.removeItem('researchscope_auth');
  } catch (e) {
    console.error('Failed to clear auth session:', e);
  }
}

export function getAuthHeaders(customHeaders = {}) {
  const headers = { 'Content-Type': 'application/json', ...customHeaders };
  const auth = getStoredAuth();
  if (auth && (auth.token || auth.user?.id || auth.id)) {
    const token = auth.token || auth.user?.id || auth.id;
    headers['X-User-Id'] = token;
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// --- Auth APIs ---
export async function loginUser(credentials) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    throw new Error(errorText || 'Authentication failed. Please verify your credentials.');
  }
  const data = await res.json();
  setStoredAuth(data);
  return data;
}

export async function registerUser(userData) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    throw new Error(errorText || 'Registration failed. Please try again.');
  }
  const data = await res.json();
  setStoredAuth(data);
  return data;
}

export async function fetchCurrentUser() {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch user session');
  return res.json();
}

export async function updateUserProfile(profileData) {
  const res = await fetch(`${API_BASE}/auth/profile`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(profileData)
  });
  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    throw new Error(errorText || 'Failed to update profile');
  }
  const updatedUser = await res.json();
  const current = getStoredAuth();
  if (current) {
    setStoredAuth({ ...current, user: updatedUser });
  }
  return updatedUser;
}

export function logoutUser() {
  clearStoredAuth();
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

// --- AI Research Assistant APIs ---
export async function askAiAssistant(data) {
  const res = await fetch(`${API_BASE}/ai/ask`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(errText || 'Failed to query AI Research Assistant');
  }
  return res.json();
}

export async function summarizePaperAi(data) {
  const res = await fetch(`${API_BASE}/ai/summarize`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(errText || 'Failed to generate AI summary');
  }
  return res.json();
}

export async function generateResearchQuestionsAi(data) {
  const res = await fetch(`${API_BASE}/ai/research-questions`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(errText || 'Failed to generate research questions');
  }
  return res.json();
}

export async function fetchAiSuggestedPrompts() {
  const res = await fetch(`${API_BASE}/ai/suggested-prompts`);
  if (!res.ok) throw new Error('Failed to fetch suggested research prompts');
  return res.json();
}

// --- Automated Literature Review Generator APIs ---
export async function generateLiteratureReview(data) {
  const res = await fetch(`${API_BASE}/literature-reviews/generate`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(errText || 'Failed to generate literature review');
  }
  return res.json();
}

export async function fetchUserLiteratureReviews() {
  const res = await fetch(`${API_BASE}/literature-reviews`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch user literature reviews');
  return res.json();
}

export async function fetchLiteratureReviewById(id) {
  const res = await fetch(`${API_BASE}/literature-reviews/${encodeURIComponent(id)}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch literature review record');
  return res.json();
}

export async function updateLiteratureReviewSection(reviewId, sectionKey, content) {
  const res = await fetch(`${API_BASE}/literature-reviews/${encodeURIComponent(reviewId)}/sections/${encodeURIComponent(sectionKey)}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ content })
  });
  if (!res.ok) throw new Error('Failed to update literature review section');
  return res.json();
}

export async function regenerateLiteratureReviewSection(reviewId, sectionKey, instructions = '') {
  const res = await fetch(`${API_BASE}/literature-reviews/${encodeURIComponent(reviewId)}/sections/${encodeURIComponent(sectionKey)}/regenerate`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ instructions })
  });
  if (!res.ok) throw new Error('Failed to regenerate literature review section');
  return res.json();
}

export async function deleteLiteratureReview(id) {
  const res = await fetch(`${API_BASE}/literature-reviews/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to delete literature review');
  return res.json();
}

export function getLiteratureReviewExportUrl(id, format = 'latex') {
  return `${API_BASE}/literature-reviews/${encodeURIComponent(id)}/export/${encodeURIComponent(format)}`;
}

// --- Research Methodology Analyzer APIs ---
export async function analyzeMethodology(paperIds = []) {
  const res = await fetch(`${API_BASE}/methodology/analyze`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ paperIds })
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(errText || 'Failed to analyze methodology');
  }
  return res.json();
}

export async function updateMethodologyField(paperId, fieldName, correctedValue) {
  const res = await fetch(`${API_BASE}/methodology/${encodeURIComponent(paperId)}/field`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ fieldName, correctedValue })
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(errText || 'Failed to update methodology field');
  }
  return res.json();
}

export function getMethodologyCsvUrl(paperIds = []) {
  const query = paperIds && paperIds.length > 0 ? `?paperIds=${paperIds.map(encodeURIComponent).join(',')}` : '';
  return `${API_BASE}/methodology/export/csv${query}`;
}

// --- Research Collaboration & Shared Workspace APIs ---
export async function fetchUserTeams() {
  const res = await fetch(`${API_BASE}/teams`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch research teams');
  return res.json();
}

export async function createResearchTeam(data) {
  const res = await fetch(`${API_BASE}/teams`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(err || 'Failed to create research team');
  }
  return res.json();
}

export async function fetchTeamDetails(teamId) {
  const res = await fetch(`${API_BASE}/teams/${encodeURIComponent(teamId)}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch team details');
  return res.json();
}

export async function updateResearchTeam(teamId, data) {
  const res = await fetch(`${API_BASE}/teams/${encodeURIComponent(teamId)}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update research team');
  return res.json();
}

export async function deleteResearchTeam(teamId) {
  const res = await fetch(`${API_BASE}/teams/${encodeURIComponent(teamId)}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to delete research team');
  return res.json();
}

export async function addTeamMember(teamId, data) {
  const res = await fetch(`${API_BASE}/teams/${encodeURIComponent(teamId)}/members`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(err || 'Failed to add team member');
  }
  return res.json();
}

export async function updateTeamMemberRole(teamId, memberId, role) {
  const res = await fetch(`${API_BASE}/teams/${encodeURIComponent(teamId)}/members/${encodeURIComponent(memberId)}/role`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ role })
  });
  if (!res.ok) throw new Error('Failed to update member role');
  return res.json();
}

export async function removeTeamMember(teamId, memberId) {
  const res = await fetch(`${API_BASE}/teams/${encodeURIComponent(teamId)}/members/${encodeURIComponent(memberId)}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to remove team member');
  return res.json();
}

export async function addTeamPaper(teamId, data) {
  const res = await fetch(`${API_BASE}/teams/${encodeURIComponent(teamId)}/papers`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(err || 'Failed to add paper to team');
  }
  return res.json();
}

export async function updateTeamPaperAssignment(teamId, teamPaperId, data) {
  const res = await fetch(`${API_BASE}/teams/${encodeURIComponent(teamId)}/papers/${encodeURIComponent(teamPaperId)}/assignment`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update paper assignment');
  return res.json();
}

export async function removeTeamPaper(teamId, teamPaperId) {
  const res = await fetch(`${API_BASE}/teams/${encodeURIComponent(teamId)}/papers/${encodeURIComponent(teamPaperId)}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to remove paper from team');
  return res.json();
}

export async function fetchTeamPaperComments(teamId, paperId) {
  const res = await fetch(`${API_BASE}/teams/${encodeURIComponent(teamId)}/papers/${encodeURIComponent(paperId)}/comments`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch team comments');
  return res.json();
}

export async function addTeamPaperComment(teamId, paperId, data) {
  const res = await fetch(`${API_BASE}/teams/${encodeURIComponent(teamId)}/papers/${encodeURIComponent(paperId)}/comments`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to add team comment');
  return res.json();
}

export function getTeamMatrixCsvUrl(teamId) {
  return `${API_BASE}/teams/${encodeURIComponent(teamId)}/export/csv`;
}

// --- Smart Recommendations & Alerts APIs ---
export async function fetchPersonalizedRecommendations(limit = 10) {
  const res = await fetch(`${API_BASE}/recommendations/personalized?limit=${encodeURIComponent(limit)}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch recommendations');
  return res.json();
}

export async function fetchUserAlerts() {
  const res = await fetch(`${API_BASE}/alerts/subscriptions`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch alert subscriptions');
  return res.json();
}

export async function subscribeAlert(data) {
  const res = await fetch(`${API_BASE}/alerts/subscriptions`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(err || 'Failed to subscribe to alert');
  }
  return res.json();
}

export async function deleteAlert(alertId) {
  const res = await fetch(`${API_BASE}/alerts/subscriptions/${encodeURIComponent(alertId)}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to remove alert');
  return res.json();
}

export async function fetchAlertNotifications() {
  const res = await fetch(`${API_BASE}/alerts/notifications`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch alert notifications');
  return res.json();
}


