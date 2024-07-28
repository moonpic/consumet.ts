import { AxiosAdapter } from 'axios';
import { load } from 'cheerio';

import {
  AnimeParser,
  ISearch,
  IAnimeInfo,
  IEpisodeServer,
  IVideo,
  StreamingServers,
  MediaStatus,
  SubOrSub,
  IAnimeResult,
  ISource,
  MediaFormat,
  ProxyConfig,
} from '../../models';

class AnimeFlv extends AnimeParser {
  fetchEpisodeSources(episodeId: string, ...args: any): Promise<ISource> {
    throw new Error('Method not implemented.');
  }
  override readonly name = 'AnimeFlv';
  protected override baseUrl = 'https://jimov-api.vercel.app';
  protected override logo = 'https://animeflv.vc/static/img/icon/logo.png';
  protected override classPath = 'ANIME.AnimeFlv';

  constructor(customBaseURL?: string, proxy?: ProxyConfig, adapter?: AxiosAdapter) {
    super(...arguments);
    this.baseUrl = customBaseURL ? `https://${customBaseURL}` : this.baseUrl;
    if (proxy) {
      this.setProxy(proxy);
    }
    if (adapter) {
      this.setAxiosAdapter(adapter);
    }
  }

  override search = async (query: string, page: number = 1): Promise<ISearch<IAnimeResult>> => {
    const searchResult: ISearch<IAnimeResult> = {
      currentPage: page,
      hasNextPage: false,
      results: [],
    };
    try {
      // Replace spaces with hyphens
      const modifiedQuery = query.replace(/\s+/g, '-');

      const res = await this.client.get(
        `${this.baseUrl}/anime/flv/filter?title=${encodeURIComponent(modifiedQuery)}&page=${page}`
      );

      const $ = load(res.data);

      searchResult.hasNextPage = res.data.hasNextPage;

      res.data.results.forEach((item: any) => {
        searchResult.results.push({
          id: item.url,
          title: item.name,
          url: item.url,
          image: item.image.replace('https://img.animeflv.bz', 'https://img.animeflv.ws'),
          releaseDate: item.releaseDate,
          subOrDub: item.type.toLowerCase().includes('dub') ? SubOrSub.DUB : SubOrSub.SUB,
        });
      });

      return searchResult;
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Error during search:', err.message);
        throw new Error(err.message);
      } else {
        console.error('Unknown error during search');
        throw new Error('Unknown error occurred');
      }
    }
  };

  override fetchAnimeInfo = async (id: string): Promise<IAnimeInfo> => {
    const animeInfo: IAnimeInfo = {
      id: '',
      title: '',
      url: '',
      genres: [],
      totalEpisodes: 0,
    };
    try {
      const res = await this.client.get(`${this.baseUrl}/anime/flv/name/${id}`);

      const data = res.data;

      animeInfo.id = data.id;
      animeInfo.title = data.name;
      animeInfo.url = id;
      animeInfo.image = data.image.url;
      animeInfo.releaseDate = data.releaseDate;
      animeInfo.description = data.synopsis;
      animeInfo.subOrDub = data.name.toLowerCase().includes('dub') ? SubOrSub.DUB : SubOrSub.SUB;
      animeInfo.type = data.type ? (data.type.toUpperCase() as MediaFormat) : MediaFormat.UNKNOWN;
      animeInfo.status = MediaStatus.UNKNOWN;

      switch (data.status) {
        case 'En_emision':
          animeInfo.status = MediaStatus.ONGOING;
          break;
        case 'Finalizado':
          animeInfo.status = MediaStatus.COMPLETED;
          break;
        default:
          animeInfo.status = MediaStatus.UNKNOWN;
          break;
      }

      animeInfo.otherName = data.otherName;
      animeInfo.genres = data.genres;

      animeInfo.episodes = data.episodes.map((episode: any) => ({
        id: episode.url,
        number: episode.number,
        url: episode.url,
      }));

      animeInfo.totalEpisodes = data.episodes.length;

      return animeInfo;
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Error fetching anime info:', err.message);
        throw new Error(`failed to fetch anime info: ${err.message}`);
      } else {
        console.error('Unknown error fetching anime info');
        throw new Error('failed to fetch anime info: Unknown error');
      }
    }
  };

  override fetchEpisodeServers = async (episodeId: string): Promise<IEpisodeServer[]> => {
    try {
      const res = await this.client.get(`${this.baseUrl}/anime/flv/episode/${episodeId}`);

      const data = res.data;

      const servers: IEpisodeServer[] = data.servers.map((server: any) => ({
        name: server.name,
        url: server.file_url,
      }));

      return servers;
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Error fetching episode servers:', err.message);
      } else if (typeof err === 'object' && err !== null && 'response' in err) {
        console.error('Error fetching episode servers:', (err as any).response?.data || 'Unknown error');
      } else {
        console.error('Error fetching episode servers: Unknown error');
      }
      throw new Error('Episode not found.');
    }
  };
}

export default AnimeFlv;
