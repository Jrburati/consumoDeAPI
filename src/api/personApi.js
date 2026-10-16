
import axios from "axios";

export async function getPerson() {
  const response = await axios.get(
    "https://6a79e554674f43f4db11ebc8.mockapi.io/api/person/40"
  );

  return response.data;
}
