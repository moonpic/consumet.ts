import { AxiosAdapter } from 'axios';
import { AnimeParser, ISearch, IAnimeInfo, IEpisodeServer, IAnimeResult, ISource, ProxyConfig } from '../../models';
declare class AnimeFlv extends AnimeParser {
    fetchEpisodeSources(episodeId: string, ...args: any): Promise<ISource>;
    readonly name = "AnimeFlv";
    protected baseUrl: string;
    protected logo: string;
    protected classPath: string;
    constructor(customBaseURL?: string, proxy?: ProxyConfig, adapter?: AxiosAdapter);
    search: (query: string, page?: number) => Promise<ISearch<IAnimeResult>>;
    fetchAnimeInfo: (id: string) => Promise<IAnimeInfo>;
    fetchEpisodeServers: (episodeId: string) => Promise<IEpisodeServer[]>;
}
export default AnimeFlv;
