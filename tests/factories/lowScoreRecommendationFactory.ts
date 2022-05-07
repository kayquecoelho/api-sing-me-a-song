import { prisma } from "../../src/database.js";
import recommendationBodyFactory from "./recommendationBodyFactory.js";

export default async function lowScoreRecommendationFactory() {
  const recommendation = recommendationBodyFactory();

  const createdRecommendation = await prisma.recommendation.create({
    data: { ...recommendation, score: -5 },
  });

  return createdRecommendation;
}