
import axios from "axios";

export async function getDragonBallCharacter() {
  const response = await axios.get(
    "https://dragonball-api.com/api/characters/5"
  );

  return response.data;
}
  