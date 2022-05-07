import supertest from "supertest";
import app from "../../src/app.js";
import { prisma } from "../../src/database.js";
import topRecommendationsFactory from "../factories/topRecommendationFactory.js";
import recommendationFactory from "../factories/recommendationFactory.js";
import lowScoreRecommendationFactory from "../factories/lowScoreRecommendationFactory.js";
import recommendationBodyFactory from "../factories/recommendationBodyFactory.js";

describe("Integration Tests", () => {
  describe("POST /recommendations", () => {
    beforeEach(truncateRecommendations);
    afterAll(disconnect);

    it("should return status 201 and persist recommendation into database", async () => {
      const recommendation = recommendationBodyFactory();

      const response = await supertest(app)
        .post("/recommendations")
        .send(recommendation);

      const createdRecommendation = await prisma.recommendation.findUnique({
        where: { name: recommendation.name },
      });

      expect(createdRecommendation).not.toBeNull();
      expect(response.status).toEqual(201);
    });
  });

  describe("POST /recommendations/:id/upvote", () => {
    beforeEach(truncateRecommendations);
    afterAll(disconnect);

    it("should return status 200 and increase the recommendation score", async () => {
      const createdRecommendation = await recommendationFactory();

      const response = await supertest(app).post(
        `/recommendations/${createdRecommendation.id}/upvote`
      );

      const recommendation = await prisma.recommendation.findUnique({
        where: { name: createdRecommendation.name },
      });

      expect(createdRecommendation.score + 1).toEqual(recommendation.score);
      expect(response.status).toEqual(200);
    });
  });

  describe("POST /recommendations/:id/downvote", () => {
    beforeEach(truncateRecommendations);
    afterAll(disconnect);

    it("should return status 200 and decrease the recommendation score given a valid recommendation id", async () => {
      const createdRecommendation = await recommendationFactory();

      const response = await supertest(app).post(
        `/recommendations/${createdRecommendation.id}/downvote`
      );

      const recommendation = await prisma.recommendation.findUnique({
        where: { name: createdRecommendation.name },
      });

      expect(createdRecommendation.score - 1).toEqual(recommendation.score);
      expect(response.status).toEqual(200);
    });

    it("should return status 200 and delete the recommendation with score lower than -5", async () => {
      const createdRecommendation = await lowScoreRecommendationFactory();

      const response = await supertest(app).post(
        `/recommendations/${createdRecommendation.id}/downvote`
      );

      const recommendation = await prisma.recommendation.findUnique({
        where: { name: createdRecommendation.name },
      });

      expect(recommendation).toBeNull();
      expect(response.status).toEqual(200);
    });
  });

  describe("GET /recommendations", () => {
    beforeEach(truncateRecommendations);
    afterAll(disconnect);

    it("should return an empty array and status 200", async () => {
      const recommendation = await recommendationFactory();

      const response = await supertest(app).get("/recommendations");

      expect(response.status).toEqual(200);
      expect(response.body).toEqual([recommendation]);
    });  
  });

  describe("GET /recommendations/:id", () => {
    beforeEach(truncateRecommendations);
    afterAll(disconnect);

    it("should return the object of a recommendation", async () => {
      const recommendation = await recommendationFactory();

      const response = await supertest(app).get(
        `/recommendations/${recommendation.id}`
      );

      expect(response.status).toEqual(200);
      expect(response.body).toEqual(recommendation);
    });
  });

  describe("GET /recommendations/random", () => {
    beforeEach(truncateRecommendations);
    afterAll(disconnect);

    it("should return the only recommendation that exists into database", async () => {
      const recommendation = await recommendationFactory();

      const response = await supertest(app).get(`/recommendations/random`);

      expect(response.status).toEqual(200);
      expect(response.body).toEqual(recommendation);
    });
  });

  describe("GET /recommendations/top/:amount", () => {
    beforeEach(truncateRecommendations);
    afterAll(disconnect);

    it("should return an array with 2 recommendations sorted by score", async () => {
      const [topScore, lowerScore] = await topRecommendationsFactory();

      const response = await supertest(app).get("/recommendations/top/2");

      expect(response.body[0]).toEqual(topScore);
      expect(response.body[1]).toEqual(lowerScore);
      expect(response.status).toEqual(200);
    });
  });
});

async function truncateRecommendations() {
  return prisma.$executeRaw`TRUNCATE TABLE recommendations RESTART IDENTITY`;
}

async function disconnect() {
  return prisma.$disconnect();
}
