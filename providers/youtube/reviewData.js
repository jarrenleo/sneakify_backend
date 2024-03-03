import { config } from "dotenv";
import { google } from "googleapis";
config();

/**
 * Class responsible for fetching YouTube video IDs based on search criteria.
 * @class
 */
export default class ReviewData {
  /**
   * YouTube API Service instance.
   */
  youtube = google.youtube({
    version: "v3",
    auth: process.env.YOUTUBE_API_KEY,
  });

  /**
   * Retrieves relevant video IDs from YouTube based on a search query and country code.
   * @async
   * @function getRelavantVideoIds
   * @param {string} query The search query to find relevant YouTube videos.
   * @param {string} country The ISO 3166-1 alpha-2 country code to filter search results.
   * @returns {Promise<Object[]>} A promise that resolves to an array of objects, each containing a videoId.
   * @throws {Error} Throws an error if the YouTube Data API request fails.
   */
  async getRelavantVideoIds(query, country) {
    try {
      const response = await this.youtube.search.list({
        part: "snippet",
        q: query,
        regionCode: country,
        type: "video",
        videoDuration: "medium",
        videoEmbeddable: true,
      });

      const data = [];

      for (const item of response.data.items) {
        data.push({
          videoId: item.id.videoId,
        });
      }

      return data;
    } catch (error) {
      throw Error(error.message);
    }
  }
}
