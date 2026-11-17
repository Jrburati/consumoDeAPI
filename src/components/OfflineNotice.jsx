import { useOnlineStatus } from '../hooks/useOnlineStatus.jsx';

export default function OfflineNotice() {
  const isOnline = useOnlineStatus();
  return !isOnline && (
    <p role="status">Você está offline. Os dados das APIs precisam de uma conexão com a internet.</p>
  );
}
