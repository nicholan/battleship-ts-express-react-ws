import playwrightConfig from "../playwright.config.js";

const baseUrl = playwrightConfig.use?.baseURL ?? "http://localhost:3000/";

export async function clearMemoryDatabase() {
	await fetch(`${baseUrl}clearDB`, {
		method: "GET",
	});
}
