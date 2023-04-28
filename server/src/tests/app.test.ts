import supertest from "supertest";
import app from "../app.js";

const api = supertest(app);

test("index responds with status 200", async () => {
  await api.get("/").expect(200);
});
