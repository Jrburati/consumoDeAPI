import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import "./App.css";
import axios from "axios";
import MovieTe from "./assets/components/listMovie"; // componente filmes

function App() {
  const [count, setCount] = useState(0);
  const [perfil, setPerfil] = useState({});
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [DBZ, setDBZ] = useState({});
  const [poke, setPoke] = useState({});
  const [filme, setFilme] = useState({});

useEffect(() => {
    const getData = async () => {
      try {
        const response = await axios.get(
          "https://6a79e554674f43f4db11ebc8.mockapi.io/api/person/40"
        );
        const responseDBZ = await axios.get(
          "https://dragonball-api.com/api/characters/5"
        );
        const responsePoke = await axios.get(
          "https://pokeapi.co/api/v2/pokemon/bulbasaur"
        );
        const responseFilme = await axios.get(
          "https://www.omdbapi.com/?t=Fear+and+Loathing+in+Las+Vegas&apikey=59ab1eb9"
        );

        // mudei o nome direto no código
        const dadosPerfil = response.data;
        dadosPerfil.nome = "Buratti"; 
        // -------------------------------------------------

        setPoke(responsePoke.data);
        setDBZ(responseDBZ.data);
        setPerfil(dadosPerfil); //  variável do nome alterado
        setFilme(responseFilme.data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        setError(true);
        console.log("Error: ", error);
      }
    };
    getData();
  }, []);

  if (loading) {
    return <div>Loading</div>;
  }
  if (error) {
    return <div>Ocorreu um erro inesperado</div>;
  }

  return (
    <>
      <section id="center">
        <div>
          <img
            src={DBZ.image}
            className="base"
            height="280"
            alt=""
            style={{ marginTop: "50px" }}
          />
        </div>
        <div>
          <h1>{perfil.nome}</h1>
          <p>
            Edit <code>src/App.jsx</code> and save to test <code>HMR</code>
          </p>
        </div>
        <button
          type="button"
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <h2>{poke.species.name}</h2>
          <img
            src={poke.sprites.front_shiny}
            className="base"
            width="170"
            height="179"
            alt=""
          />
          <p>Meu Pet</p>
        </div>
        
        <div id="social">
          <h2>Meu filme favorito é: {filme.Title}</h2>
          <img
            src={filme.Poster}
            className="base"
            width="170"
            height="179"
            alt=""
          />
          <p>Nota do IMDB: {filme.imdbRating}</p>
        </div>
      </section>

      <div className="ticks"></div>
      
      {/* Aqui está o componente de busca de filmes! */}
      <section style={{ padding: '20px', borderTop: '2px solid #ccc', marginTop: '20px' }}>
        <MovieTe />
      </section>

      <section id="spacer"></section>
    </>
  );
}

export default App;