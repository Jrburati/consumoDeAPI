import NavigateButton from '../components/NavigateButton.jsx';
import DragonBallCharacter from '../components/DragonBallCharacter.jsx';
import Profile from '../components/Profile.jsx';
import Counter from '../components/Counter.jsx';

export default function DragonBall() {
  return (
    <main id="center" className="page">
      <h1>Dragon Ball</h1>
      <DragonBallCharacter />
      <Profile />
      <Counter />
      <NavigateButton path="/">Voltar para Home</NavigateButton>
    </main>
  );
}
