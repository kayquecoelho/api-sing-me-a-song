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
