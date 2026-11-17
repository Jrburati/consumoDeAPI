import { usePerson } from '../hooks/usePerson.jsx';
import { useOnlineStatus } from '../hooks/useOnlineStatus.jsx';

export default function Profile() {
  const { perfil, loading: loadingPerson, error: errorPerson } = usePerson();
  const isOnline = useOnlineStatus();

  return (
    <>
      {loadingPerson ? (
        isOnline && <p>Loading...</p>
      ) : errorPerson ? (
        isOnline && <p>Erro ao carregar o perfil.</p>
      ) : (
        <h1>{perfil?.nome}</h1>
      )}
    </>
  );
}
