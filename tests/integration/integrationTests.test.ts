import { CreateRecommendationData } from "../../src/services/recommendationsService.js";
import supertest from "supertest";
import app from "../../src/app.js";
import { prisma } from "../../src/database.js";

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

});

async function truncateRecommendations() {
  return prisma.$executeRaw`TRUNCATE TABLE recommendations RESTART IDENTITY`;
}

async function disconnect() {
  return prisma.$disconnect();
}

function recommendationBodyFactory() {
  const recommendation: CreateRecommendationData = {
    name: "the 1",
    youtubeLink: "https://www.youtube.com/watch?v=KsZ6tROaVOQ",
  };
  return recommendation;
}

async function recommendationFactory() {
  const recommendation = recommendationBodyFactory();

  const createdRecommendation = await prisma.recommendation.create({
    data: recommendation,
  });

  return createdRecommendation;
}

async function lowScoreRecommendationFactory() {
  const recommendation = recommendationBodyFactory();

  const createdRecommendation = await prisma.recommendation.create({
    data: { ...recommendation, score: -5 },
  });

  return createdRecommendation;
}
