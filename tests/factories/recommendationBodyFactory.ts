import { CreateRecommendationData } from "../../src/services/recommendationsService";

export default function recommendationBodyFactory() {
  const recommendation: CreateRecommendationData = {
    name: "the 1",
    youtubeLink: "https://www.youtube.com/watch?v=KsZ6tROaVOQ",
  };
  return recommendation;
}