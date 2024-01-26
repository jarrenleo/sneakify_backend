import { config } from "dotenv";
import { google } from "googleapis";
config();

export default class VideoData {
  constructor() {
    this.youtube = google.youtube({
      version: "v3",
      auth: process.env.YOUTUBE_API_KEY,
    });
  }

  async getRelatedVideos(query, country) {
    const response = await this.youtube.search.list({
      part: "snippet",
      q: query,
      regionCode: country,
      type: "video",
      videoDuration: "medium",
      videoEmbeddable: true,
    });

    if (!response.data.pageInfo.resultsPerPage)
      return { message: "No related videos" };

    const data = [];

    for (const item of response.data.items) {
      data.push({
        videoId: item.id.videoId,
      });
    }

    return data;
  }
}
