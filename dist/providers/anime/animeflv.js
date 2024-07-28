"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = require("cheerio");
const models_1 = require("../../models");
class AnimeFlv extends models_1.AnimeParser {
    fetchEpisodeSources(episodeId, ...args) {
        throw new Error('Method not implemented.');
    }
    constructor(customBaseURL, proxy, adapter) {
        super(...arguments);
        this.name = 'AnimeFlv';
        this.baseUrl = 'https://jimov-api.vercel.app';
        this.logo = 'https://animeflv.vc/static/img/icon/logo.png';
        this.classPath = 'ANIME.AnimeFlv';
        this.search = async (query, page = 1) => {
            const searchResult = {
                currentPage: page,
                hasNextPage: false,
                results: [],
            };
            try {
                // Replace spaces with hyphens
                const modifiedQuery = query.replace(/\s+/g, '-');
                const res = await this.client.get(`${this.baseUrl}/anime/flv/filter?title=${encodeURIComponent(modifiedQuery)}&page=${page}`);
                const $ = (0, cheerio_1.load)(res.data);
                searchResult.hasNextPage = res.data.hasNextPage;
                res.data.results.forEach((item) => {
                    searchResult.results.push({
                        id: item.url,
                        title: item.name,
                        url: item.url,
                        image: item.image.replace('https://img.animeflv.bz', 'https://img.animeflv.ws'),
                        releaseDate: item.releaseDate,
                        subOrDub: item.type.toLowerCase().includes('dub') ? models_1.SubOrSub.DUB : models_1.SubOrSub.SUB,
                    });
                });
                return searchResult;
            }
            catch (err) {
                if (err instanceof Error) {
                    console.error('Error during search:', err.message);
                    throw new Error(err.message);
                }
                else {
                    console.error('Unknown error during search');
                    throw new Error('Unknown error occurred');
                }
            }
        };
        this.fetchAnimeInfo = async (id) => {
            const animeInfo = {
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
                animeInfo.subOrDub = data.name.toLowerCase().includes('dub') ? models_1.SubOrSub.DUB : models_1.SubOrSub.SUB;
                animeInfo.type = data.type ? data.type.toUpperCase() : models_1.MediaFormat.UNKNOWN;
                animeInfo.status = models_1.MediaStatus.UNKNOWN;
                switch (data.status) {
                    case 'En_emision':
                        animeInfo.status = models_1.MediaStatus.ONGOING;
                        break;
                    case 'Finalizado':
                        animeInfo.status = models_1.MediaStatus.COMPLETED;
                        break;
                    default:
                        animeInfo.status = models_1.MediaStatus.UNKNOWN;
                        break;
                }
                animeInfo.otherName = data.otherName;
                animeInfo.genres = data.genres;
                animeInfo.episodes = data.episodes.map((episode) => ({
                    id: episode.url,
                    number: episode.number,
                    url: episode.url,
                }));
                animeInfo.totalEpisodes = data.episodes.length;
                return animeInfo;
            }
            catch (err) {
                if (err instanceof Error) {
                    console.error('Error fetching anime info:', err.message);
                    throw new Error(`failed to fetch anime info: ${err.message}`);
                }
                else {
                    console.error('Unknown error fetching anime info');
                    throw new Error('failed to fetch anime info: Unknown error');
                }
            }
        };
        this.fetchEpisodeServers = async (episodeId) => {
            var _a;
            try {
                const res = await this.client.get(`${this.baseUrl}/anime/flv/episode/${episodeId}`);
                const data = res.data;
                const servers = data.servers.map((server) => ({
                    name: server.name,
                    url: server.file_url,
                }));
                return servers;
            }
            catch (err) {
                if (err instanceof Error) {
                    console.error('Error fetching episode servers:', err.message);
                }
                else if (typeof err === 'object' && err !== null && 'response' in err) {
                    console.error('Error fetching episode servers:', ((_a = err.response) === null || _a === void 0 ? void 0 : _a.data) || 'Unknown error');
                }
                else {
                    console.error('Error fetching episode servers: Unknown error');
                }
                throw new Error('Episode not found.');
            }
        };
        this.baseUrl = customBaseURL ? `https://${customBaseURL}` : this.baseUrl;
        if (proxy) {
            this.setProxy(proxy);
        }
        if (adapter) {
            this.setAxiosAdapter(adapter);
        }
    }
}
exports.default = AnimeFlv;
//# sourceMappingURL=animeflv.js.map