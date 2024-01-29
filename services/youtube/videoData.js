import { config } from "dotenv";
import { google } from "googleapis";
config();

export default class VideoData {
  youtube = google.youtube({
    version: "v3",
    auth: process.env.YOUTUBE_API_KEY,
  });

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
      // Log to vercel
      throw Error(error.message);
    }
  }
}
