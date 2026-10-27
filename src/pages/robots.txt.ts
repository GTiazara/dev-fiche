/**
 * Consigne d'exploration pour les robots.
 * Autorise les pages publiques. Ajoute l'adresse du plan lorsque le site est connu.
 * L'adresse du site reçoit une barre finale : sans elle, le nom du dernier dossier serait remplacé.
 */
export const GET = ({ site }) => {
  const lignes = ['User-agent: *', 'Allow: /'];
  if (site) {
    const racine = site.href.endsWith('/') ? site.href : `${site.href}/`;
    lignes.push(`Sitemap: ${new URL('sitemap-index.xml', racine).href}`);
  }
  return new Response(`${lignes.join('\n')}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
