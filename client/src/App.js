import { Router } from "react-router-dom";
import history from "./utils/history";
import Routes from "./Routes";
//import ReactGA from "react-ga";

//ReactGA.initialize("");
//ReactGA.pageview(window.location.pathname + window.location.search);

/*history.listen((location) => {
  ReactGA.set({ page: location.pathname });
  ReactGA.pageview(location.pathname);
});*/

function App() {
  return (
    <>
      <Router history={history}>
        <Routes />
      </Router>
    </>
  );
}

export default App;
