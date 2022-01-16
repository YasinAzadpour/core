const useState = React.useState;
const useEffect = React.useEffect;
const useContext = React.useContext;
const createContext = React.createContext;

const Loading = () => {
  return (
    <span id="loading">
      <span>•</span>
      <span>•</span>
      <span>•</span>
    </span>
  );
};

const changePage = (title, url) => {
  window.history.pushState(null, null, url);
  document.title = title;
};
