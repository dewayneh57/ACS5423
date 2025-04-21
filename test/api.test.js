const chai = require("chai");
const expect = chai.expect;
const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../App");

describe("API Tests", function () {
  this.timeout(5000); 

  describe("GET /api/options", () => {
    it("should return options with default or stored values", async () => {
      const res = await request(app).get("/api/options");

      expect(res.statusCode).to.equal(200);
      expect(res.body).to.have.property("limit");
      expect(res.body).to.have.property("caseSensitive");
    });
  });

  describe("POST /api/options", () => {
    it("should update options successfully", async () => {
      const res = await request(app)
        .post("/api/options")
        .send({ limit: 25, caseSensitive: true });

      expect(res.statusCode).to.equal(204);
    });
  });
});

after(async () => {
  await mongoose.disconnect();
});
