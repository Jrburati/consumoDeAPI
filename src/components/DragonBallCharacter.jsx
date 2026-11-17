import { useDragonBall } from '../hooks/useDragonBall.jsx';
import { useOnlineStatus } from '../hooks/useOnlineStatus.jsx';

export default function DragonBallCharacter() {
  const { DBZ, loading: loadingDBZ, error: errorDBZ } = useDragonBall();
  const isOnline = useOnlineStatus();

  return (
    <>
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
    </>
  );
}
