import { jest } from "@jest/globals";
import { recommendationRepository } from "../../src/repositories/recommendationRepository.js";
import { recommendationService } from "../../src/services/recommendationsService.js";
import { conflictError } from "../../src/utils/errorUtils.js";
import recommendationBodyFactory from "../factories/recommendationBodyFactory.js";

describe("POST /recommendations", () => {
  it("should return status 409 given a duplicate recommendation", async () => {
    const recommendation = recommendationBodyFactory();

    jest
      .spyOn(recommendationRepository, "findByName")
      .mockResolvedValue({ ...recommendation, score: 1, id: 1 });

    expect(recommendationService.insert(recommendation)).rejects.toEqual(
      conflictError("Recommendation exists")
    );
  });
});
