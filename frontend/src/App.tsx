import "./App.css";
import { Switch, Route } from "react-router-dom";
import GenreList from "src/components/GenreList";
import LevelList from "src/components/LevelList";
import Login from "src/components/Login";
import Logout from "src/components/Logout";
import NavBar from "src/components/NavBar";
import Profile from "src/components/Profile";
import ProfileEdit from "src/components/ProfileEdit";
import Register from "src/components/Register";
import TagList from "src/components/TagList";
import { UserContextProvider } from "src/shared/contexts/UserContext";

function App() {
  return (
    <UserContextProvider>
      <NavBar />
      <main id="Content" className="MainContainer">
        <Switch>
          <Route exact path="/" component={LevelList} />
          <Route exact path="/tags" component={TagList} />
          <Route exact path="/genres" component={GenreList} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/logout" component={Logout} />
          <Route exact path="/register" component={Register} />
          <Route exact path="/profile" component={Profile} />
          <Route exact path="/profile/:userId" component={Profile} />
          <Route exact path="/profile/:userId/edit" component={ProfileEdit} />
        </Switch>
      </main>
    </UserContextProvider>
  );
}

export default App;
