import { defineConfig, devices } from '@playwright/test';

// Les tests de bout en bout visent le site construit, tel qu'il est publié.
export default defineConfig({
    testDir: './e2e',
    use: { baseURL: 'http://localhost:4399', trace: 'retain-on-failure' },
    projects: [
        { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
        { name: 'mobile', use: { ...devices['Pixel 7'] } },
    ],
    // Port dédié et pas de réutilisation : un serveur de dev déjà lancé fausserait le test.
    webServer: {
        command: 'npm run build && npm run preview -- --port 4399',
        url: 'http://localhost:4399',
        reuseExistingServer: false,
        timeout: 120_000,
    },
});
