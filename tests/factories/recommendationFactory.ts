import { prisma } from "../../src/database.js";
import recommendationBodyFactory from "./recommendationBodyFactory.js";

export default async function recommendationFactory() {
  const recommendation = recommendationBodyFactory();

  const createdRecommendation = await prisma.recommendation.create({
    data: recommendation,
  });

  return createdRecommendation;
}