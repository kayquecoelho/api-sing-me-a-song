import { jest } from "@jest/globals";
import { Recommendation } from "@prisma/client";
import { recommendationRepository } from "../../src/repositories/recommendationRepository.js";
import { recommendationService } from "../../src/services/recommendationsService.js";
import { conflictError, notFoundError } from "../../src/utils/errorUtils.js";
import recommendationBodyFactory from "../factories/recommendationBodyFactory.js";

describe("Unitary Tests Recommendations", () => {
  describe("POST /recommendations", () => {
    it("should return status 409 given a duplicate recommendation", async () => {
      const recommendation = recommendationBodyFactory();

      jest
        .spyOn(recommendationRepository, "findByName")
        .mockResolvedValueOnce({ ...recommendation, score: 1, id: 1 });

      expect(recommendationService.insert(recommendation)).rejects.toEqual(
        conflictError("Recommendation exists")
      );
    });
  });

  describe("POST /recommendations/:id/upvote", () => {
    it("should return status 404 given an invalid recommendationId", async () => {
      jest
        .spyOn(recommendationRepository, "findById")
        .mockResolvedValueOnce(null);

      expect(recommendationService.upvote(1)).rejects.toEqual(notFoundError());
    });
  });

  describe("POST /recommendations/:id/downvote", () => {
    it("should return status 404 given an invalid recommendationId", async () => {
      jest
        .spyOn(recommendationRepository, "findById")
        .mockResolvedValueOnce(null);

      expect(recommendationService.downvote(1)).rejects.toEqual(
        notFoundError()
      );
    });
  });

  describe("GET /recommendations/random", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should throw a notFoundError given that there's no recommendations", async () => {
      jest.spyOn(global.Math, "random").mockReturnValueOnce(0.1);

      const findAll = jest
        .spyOn(recommendationRepository, "findAll")
        .mockResolvedValue([]);

      let response;

      try {
        response = await recommendationService.getRandom();
      } catch (error) {
        response = error;
      }

      expect(response).toEqual(notFoundError());
      expect(findAll).toBeCalledWith({ score: 10, scoreFilter: "gt" });
      expect(findAll).toBeCalledWith();
    });

    it("should throw a notFoundError given that there's no recommendations", async () => {
      jest.spyOn(global.Math, "random").mockReturnValueOnce(0.8);

      const findAll = jest
        .spyOn(recommendationRepository, "findAll")
        .mockResolvedValue([]);

      let response;

      try {
        response = await recommendationService.getRandom();
      } catch (error) {
        response = error;
      }

      expect(response).toEqual(notFoundError());
      expect(findAll).toBeCalledWith({ score: 10, scoreFilter: "lte" });
      expect(findAll).toBeCalledWith();
    });

    it("should return a recommendation with score greater than 10", async () => {
      const recommendations: Recommendation[] = [
        {
          id: 1,
          name: "cardigan",
          youtubeLink: "https://www.youtube.com/watch?v=K-a8s8OLBSE",
          score: 15,
        },
        {
          id: 2,
          name: "august",
          youtubeLink: "https://www.youtube.com/watch?v=nn_0zPAfyo8",
          score: 14,
        },
      ];

      jest.spyOn(global.Math, "random").mockReturnValue(0.5);

      const findAll = jest
        .spyOn(recommendationRepository, "findAll")
        .mockResolvedValue(recommendations);

      const response = await recommendationService.getRandom();

      expect(findAll).toBeCalledWith({ score: 10, scoreFilter: "gt" });
      expect(response).toEqual(recommendations[1]);
    });

    it("should return a recommendation with score between -5 and 10", async () => {
      const recommendations: Recommendation[] = [
        {
          id: 1,
          name: "cardigan",
          youtubeLink: "https://www.youtube.com/watch?v=K-a8s8OLBSE",
          score: 7,
        },
        {
          id: 2,
          name: "august",
          youtubeLink: "https://www.youtube.com/watch?v=nn_0zPAfyo8",
          score: 8,
        },
      ];

      const random = jest
        .spyOn(global.Math, "random")
        .mockReturnValueOnce(0.9)
        .mockReturnValueOnce(0.3);

      const findAll = jest
        .spyOn(recommendationRepository, "findAll")
        .mockResolvedValue(recommendations);

      const response = await recommendationService.getRandom();

      expect(findAll).toBeCalledWith({ score: 10, scoreFilter: "lte" });
      expect(random).toHaveNthReturnedWith(1, 0.9);
      expect(random).toHaveNthReturnedWith(2, 0.3);
      expect(response).toEqual(recommendations[0]);
    });
  });
});
