import "./App.css";
import { Switch, Route } from "react-router-dom";
import LevelList from "src/components/LevelList";
import Login from "src/components/Login";
import Logout from "src/components/Logout";
import NavBar from "src/components/NavBar";
import Profile from "src/components/Profile";
import Register from "src/components/Register";
import { UserContextProvider } from "src/shared/contexts/UserContext";

function App() {
  return (
    <UserContextProvider>
      <NavBar />
      <div className="MainContainer">
        <Switch>
          <Route exact path="/" component={LevelList} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/logout" component={Logout} />
          <Route exact path="/register" component={Register} />
          <Route exact path="/profile" component={Profile} />
          <Route exact path="/profile/:userId" component={Profile} />
        </Switch>
      </div>
    </UserContextProvider>
  );
}

export default App;
