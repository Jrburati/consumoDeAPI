import { useState } from "react";
import "./App.css";

// 1.  HOOKS e EXTENSÕES 
import { usePerson } from "./hooks/usePerson.jsx";
import { useDragonBall } from "./hooks/useDragonBall.jsx";
import { usePokemon } from "./hooks/usePokemon.jsx";
import { useFilme } from "./hooks/useFilme.jsx";
import { useOnlineStatus } from "./hooks/useOnlineStatus.jsx";

// Importando o componentes 
import MovieTe from "./assets/components/listMovie.jsx"; 

function App() {
  const [count, setCount] = useState(0);
  const isOnline = useOnlineStatus();

  // 2.HOOKS PARA BUSCAR DADOS
  
  const { perfil, loading: loadingPerson, error: errorPerson } = usePerson();
  const { DBZ, loading: loadingDBZ, error: errorDBZ } = useDragonBall();
  const { poke, loading: loadingPoke, error: errorPoke } = usePokemon();
  const { filme, loading: loadingFilme, error: errorFilme } = useFilme();

  return (
    <>
      {!isOnline && (
        <p role="status">Você está offline. Os dados das APIs precisam de uma conexão com a internet.</p>
      )}
      <section id="center">
        <div>
          {loadingDBZ ? (
            isOnline && <p>Loading...</p>
          ) : errorDBZ ? (
            isOnline && <p>Erro ao carregar o personagem.</p>
          ) : (
            <img
              src={DBZ?.image}
              className="base"
              height="280"
              alt=""
              style={{ marginTop: "50px" }}
            />
          )}
        </div>
        <div>
          {loadingPerson ? (
            isOnline && <p>Loading...</p>
          ) : errorPerson ? (
            isOnline && <p>Erro ao carregar o perfil.</p>
          ) : (
            <h1>{perfil?.nome}</h1>
          )}
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
          {loadingPoke ? (
            isOnline && <p>Loading...</p>
          ) : errorPoke ? (
            isOnline && <p>Erro ao carregar o Pokémon.</p>
          ) : (
            <>
              <h2>{poke?.species?.name}</h2>
              <img
                src={poke?.sprites?.front_shiny}
                className="base"
                width="170"
                height="179"
                alt=""
              />
              <p>Meu Pet</p>
            </>
          )}
        </div>
        
        <div id="social">
          {loadingFilme ? (
            isOnline && <p>Loading...</p>
          ) : errorFilme ? (
            isOnline && <p>Erro ao carregar o filme favorito.</p>
          ) : (
            <>
              <h2>Meu filme favorito é: {filme?.Title}</h2>
              <img
                src={filme?.Poster}
                className="base"
                width="170"
                height="179"
                alt=""
              />
              <p>Nota do IMDB: {filme?.imdbRating}</p>
            </>
          )}
        </div>
      </section>

      <div className="ticks"></div>
      
      {/* Busca de filmes */}
      <section style={{ padding: '20px', borderTop: '2px solid #ccc', marginTop: '20px' }}>
        <MovieTe />
      </section>

      <section id="spacer"></section>
    </>
  );
}

export default App;
