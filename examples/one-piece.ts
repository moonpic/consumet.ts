import { ANIME } from "../dist";

const main = async () => {
  // Create a new instance of the Gogoanime provider
  const jimov = new ANIME.Jimov();
  // Search for an anime. In this case, "One Piece"
  const results = await jimov.fetchAnimeInfo("naruto-shippuden-hd");
  // print the results
  console.log(results);
};

main();
