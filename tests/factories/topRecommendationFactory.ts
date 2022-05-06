import { Recommendation } from "@prisma/client";
import { prisma } from "../../src/database.js";


async function topRecommendationsFactory() {
  const topScoreRecommendation: Recommendation = {
    id: 1,
    name: "Cruel Summer",
    youtubeLink: "https://www.youtube.com/watch?v=ic8j13piAhQ",
    score: 15
  };
  
  const lowerScoreRecommendation: Recommendation = {
    id: 2,
    name: "Memories",
    youtubeLink: "https://www.youtube.com/watch?v=2lSyHZLzNYA",
    score: 14
  };
  
  await prisma.recommendation.createMany({
    data: [topScoreRecommendation, lowerScoreRecommendation]
  });

  return [topScoreRecommendation, lowerScoreRecommendation];
}

export default topRecommendationsFactory;