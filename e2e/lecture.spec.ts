import { expect, test } from '@playwright/test';

test('depuis le catalogue, ouvrir une fiche affiche son contenu', async ({ page }) => {
    await page.goto('/fiches');
    await page.getByRole('link', { name: 'AGENTS.md, le guide des agents IA dans un projet' }).first().click();

    await expect(page).toHaveURL(/\/fiches\/ia_agent_agent_md$/);
    await expect(page.getByRole('heading', { level: 1, name: 'AGENTS.md, le guide des agents IA dans un projet' })).toBeVisible();
    await expect(page.locator('.reading')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Définition' })).toBeVisible();
});

test('cliquer sur la carte, hors du titre, ouvre la fiche', async ({ page }) => {
    await page.goto('/fiches');
    // Clic souris réel : le lien étiré est un pseudo-élément, Playwright le verrait comme un obstacle.
    const description = page.locator('.card', { hasText: 'AGENTS.md, le guide des agents IA dans un projet' }).locator('p').first();
    await description.scrollIntoViewIfNeeded();
    const box = await description.boundingBox();
    await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await expect(page).toHaveURL(/\/fiches\/ia_agent_agent_md$/);
});

test('le sommaire et le bouton Copier sont présents', async ({ page }) => {
    await page.goto('/fiches/ia_agent_agent_md');
    await expect(page.getByRole('navigation', { name: 'Sommaire' })).toBeVisible();
    await expect(page.locator('.copy-code').first()).toBeVisible();
});

test('le quiz se lance depuis la fiche', async ({ page }) => {
    await page.goto('/fiches/ia_agent_agent_md');
    await page.getByRole('link', { name: 'Lancer le quiz' }).click();
    await expect(page.getByText(/Question/)).toBeVisible();
});

test('une fiche en brouillon n a pas de page', async ({ page }) => {
    const response = await page.goto('/fiches/brouillon-exemple');
    expect(response?.status()).toBe(404);
});
