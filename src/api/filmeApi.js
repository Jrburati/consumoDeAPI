
import axios from "axios";

export async function getFilme() {
  const response = await axios.get(
    "https://www.omdbapi.com/?t=Fear+and+Loathing+in+Las+Vegas&apikey=59ab1eb9"
  );

  return response.data;
}
  