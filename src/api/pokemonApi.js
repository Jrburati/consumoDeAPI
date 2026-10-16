
import axios from "axios";

export async function getPokemon() {
  const response = await axios.get(
    "https://pokeapi.co/api/v2/pokemon/bulbasaur"
  );

  return response.data;
}
  