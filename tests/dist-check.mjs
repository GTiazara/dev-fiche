import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const dist = new URL('../dist/', import.meta.url);

/**
 * Lit une page construite.
 * Reçoit le chemin relatif au dossier publié.
 */
function page(relativePath) {
  const file = new URL(relativePath, dist);
  assert.equal(existsSync(file), true, `page manquante : ${relativePath}`);
  return readFileSync(file, 'utf8');
}

const home = page('index.html');
const catalog = page('fiches/index.html');
const technologies = page('technologies/index.html');
const agentTechnology = page('technologies/ia_agent/index.html');
const about = page('a-propos/index.html');
const missing = page('404.html');
const fiche = page('fiches/agents-md-guide-des-agents-ia/index.html');
const quiz = page('fiches/agents-md-guide-des-agents-ia/quiz/index.html');
const search = page('recherche/index.html');
const index = JSON.parse(page('search-index.json'));

// Seule la fiche IA Agent est publiée : toutes les autres sont en brouillon.
const published = ['agents-md-guide-des-agents-ia'];
const drafts = [
  'brouillon-exemple',
  'les-variables-en-javascript',
  'les-fonctions-en-javascript',
  'les-objets-en-javascript',
  'les-listes-en-python',
  'les-fonctions-en-python',
  'les-dictionnaires-en-python',
  'le-depot-local',
  'les-commits',
  'les-branches',
];

assert.equal(existsSync(new URL('server/', dist)), false);
assert.match(home, /<strong>1<\/strong>\s*fiches/);
assert.match(home, /IA Agent/);
assert.match(home, /AGENTS\.md, le guide des agents IA/);
assert.match(home, /min/);
assert.match(catalog, /<h2><a href="\/fiches\/agents-md-guide-des-agents-ia">/);
assert.match(catalog, /Aucune fiche ne correspond à ces filtres/);
assert.match(technologies, /IA Agent/);
assert.match(agentTechnology, /AGENTS\.md, le guide des agents IA/);
assert.match(about, /sans créer de compte/);
assert.match(missing, /Cette page est introuvable/);
assert.match(missing, /href="\/fiches"/);
assert.match(fiche, /Débutant/);
assert.match(fiche, /class="retenir"/);
assert.match(fiche, /Définition[\s\S]*Exemple de code[\s\S]*À retenir/);
assert.match(fiche, /Lancer le quiz/);
assert.match(quiz, /Question/);
assert.match(quiz, /sur/);
const builtFiles = walk(fileURLToPath(dist), ['.html', '.js']).join('\n');
assert.match(builtFiles, /Aucune fiche ne correspond à cette recherche/);
assert.deepEqual(index.map((item) => item.id), published);

for (const id of drafts) {
  assert.equal(existsSync(new URL(`fiches/${id}/index.html`, dist)), false, `brouillon publié : ${id}`);
}
// Une technologie sans fiche publiée n'a pas de page.
for (const slug of ['javascript', 'python', 'git']) {
  assert.equal(existsSync(new URL(`technologies/${slug}/index.html`, dist)), false, slug);
}

const html = walk(fileURLToPath(dist), ['.html']).join('\n');
assert.equal(html.includes('Télécharger'), false);
assert.equal(html.includes('favori'), false);
assert.equal(html.includes('PDF'), false);
assert.equal(html.includes('Mon compte'), false);

/**
 * Concatène les fichiers HTML du dossier publié.
 */
function walk(directory, extensions) {
  const chunks = [];
  for (const name of readdirSync(directory)) {
    const full = join(directory, name);
    if (statSync(full).isDirectory()) chunks.push(...walk(full, extensions));
    else if (extensions.some((extension) => name.endsWith(extension))) chunks.push(readFileSync(full, 'utf8'));
  }
  return chunks;
}
