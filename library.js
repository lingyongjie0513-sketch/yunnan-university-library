const input = document.querySelector('#query');
const form = document.querySelector('#search-form');
const clear = document.querySelector('#clear-search');
const filters = [...document.querySelectorAll('[data-type]')];
const resources = [...document.querySelectorAll('[data-category]')];
const empty = document.querySelector('#empty');
const count = document.querySelector('#results-count');
const heading = document.querySelector('#catalog-title');

function searchable(text) {
  return text.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

const index = resources.map((card) => ({
  card,
  text: searchable(`${card.querySelector('h3').textContent} ${card.dataset.keywords} ${card.querySelector('p').textContent}`),
}));

function typeFromUrl(value) {
  return filters.some((button) => button.dataset.type === value) ? value : 'all';
}

const params = new URLSearchParams(window.location.search);
let type = typeFromUrl(params.get('type'));
input.value = (params.get('q') ?? '').slice(0, input.maxLength);

function render() {
  const words = searchable(input.value).split(' ').filter(Boolean);
  let visible = 0;
  for (const { card, text } of index) {
    const matchesType = type === 'all' || card.dataset.category === type;
    const matchesQuery = words.every((word) => text.includes(word));
    card.hidden = !(matchesType && matchesQuery);
    visible += Number(!card.hidden);
  }
  for (const button of filters) {
    button.setAttribute('aria-pressed', String(button.dataset.type === type));
  }
  count.textContent = words.length || type !== 'all' ? `找到 ${visible} 份资料` : `共 ${visible} 份资料`;
  empty.hidden = visible !== 0;
  clear.hidden = input.value.length === 0;
}

function saveQuery() {
  const url = new URL(window.location.href);
  const query = input.value.trim();
  if (query) url.searchParams.set('q', query);
  else url.searchParams.delete('q');
  if (type === 'all') url.searchParams.delete('type');
  else url.searchParams.set('type', type);
  if (url.href !== window.location.href) history.replaceState(null, '', url);
}

let saveTimer;
input.addEventListener('input', () => {
  render();
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveQuery, 250);
});

function showResults() {
  render();
  saveQuery();
  heading.focus();
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  showResults();
});

clear.addEventListener('click', () => {
  input.value = '';
  render();
  saveQuery();
  input.focus();
});

for (const button of filters) {
  button.addEventListener('click', () => {
    type = button.dataset.type;
    render();
    saveQuery();
  });
}

for (const shortcut of document.querySelectorAll('[data-query]')) {
  shortcut.addEventListener('click', () => {
    input.value = shortcut.dataset.query;
    showResults();
  });
}

document.querySelector('#reset').addEventListener('click', () => {
  input.value = '';
  type = 'all';
  showResults();
});

render();
