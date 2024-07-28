import { clearMemoryDatabase } from "./utilities/clearMemoryDatabase.js";

const globalTeardown = () => {
	clearMemoryDatabase();
	console.log("Global teardown: MongoMemoryServer database cleared.");
};

export default globalTeardown;
