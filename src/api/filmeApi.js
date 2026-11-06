
import axios from "axios";

export async function getFilme() {
  const response = await axios.get(
    "/api/movies/title",
    { params: { title: "Fear and Loathing in Las Vegas" } }
  );

  return response.data;
}
