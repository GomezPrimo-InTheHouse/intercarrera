import Auth0Login from "./components/auth0/Auth0";
import "./App.css";

function App() {
  return (
    <div className="flex w-full h-screen">
      {/* Panel izquierdo: login o usuario */}
      <Auth0Login />

      {/* Panel derecho: imagen del robot */}
      <div className="w-1/2 h-screen relative">
        <div className="robot-bg h-full w-full"></div>
      </div>
    </div>
  );
}

export default App;
