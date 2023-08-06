import { Page, Locator } from '@playwright/test';
import { getUrlParams } from '../utilities/other.js';
import { createMultiplayer } from '../utilities/database.js';
import playwrightConfig from '../playwright.config.js';

const baseUrl = playwrightConfig.use?.baseURL as string;

export class Player {
	private readonly nameInput: Locator;
	private readonly codeInput: Locator;
	private readonly aiInput: Locator;

	constructor(public readonly page: Page) {
		this.nameInput = this.page.getByRole('textbox', { name: 'Player name' });
		this.codeInput = this.page.getByRole('textbox', { name: 'Join existing game with a code' });
		this.aiInput = this.page.getByLabel('Play against AI');
	}

	async gotoPremadeLobby(gameCode: string, name: string) {
		await this.page.goto(`/${gameCode}/${name}`, { waitUntil: 'load' });
	}

	getGameCode() {
		const { gameCode } = getUrlParams(this.page.url());
		return gameCode;
	}

	async joinGame(name: string, code: string, waitForUrl = true) {
		await this.nameInput.fill(name);
		await this.codeInput.fill(code);
		await this.codeInput.press('Enter', { delay: 1 });
		waitForUrl && (await this.page.waitForURL(`**\/${code}\/${name}`));
	}

	async getPublicName(name: string) {
		await this.nameInput.fill(name);

		// Find the name followed by 3 numbers on the page.
		const regExp = new RegExp(`^${name}\\d{3}$`);
		const nameElement = this.page.getByRole('paragraph').filter({ hasText: regExp });
		return await nameElement.textContent();
	}

	async readyUp() {
		await this.page.getByRole('button', { name: 'Random' }).click();
		await this.page.getByRole('button', { name: 'Ready' }).click();
	}

	async url() {
		return this.page.url();
	}
}
