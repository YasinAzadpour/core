const NavSection = ({ name, position }) => {
  const [nav, setNav] = useState(name);
  const [num, setNum] = useState(position);
  const [show, setShow] = useState(false);
  const me = useContext(MyDataContext);

  const handleClick = (e) => {
    setNav(e.currentTarget.getAttribute("name"));
    setNum(e.currentTarget.getAttribute("itemId"));
    setShow(false);
  };

  return (
    <nav
      id="navbar"
      className={"nav__container--wrapper " + (show ? "active" : "")}
    >
      <div className="nav__user-info--container" onClick={() => setShow(true)}>
        <div className="active-user nav__user-info--photo" id="photo">
          <div className="rounded-circle">
            <img src={me.profile} alt="My profile image" />
          </div>
        </div>

        <div className="center nav__container--info__wrapper">
          <h6 className="s-text nav__container--info__name">{me.name}</h6>
          <p className="s-text nav__container--info__category">{me.category}</p>
        </div>
      </div>
      <ul className="nav__list-item--container">
        <li id="navSelector" style={{ top: num + "rem" }}></li>
        <li
          title="Home"
          name="home"
          itemID="0"
          className={"nav__item--container " + (nav === "home" ? "active" : "")}
          onClick={handleClick}
        >
          <i className="bi bi-house "></i>
          <span>Home</span>
        </li>
        <li
          title="Chats"
          itemID="3"
          name="chat"
          className={"nav__item--container " + (nav === "chat" ? "active" : "")}
          onClick={handleClick}
        >
          <i className="bi bi-chat-dots "></i>
          <span>Chats</span>
        </li>
        <li
          title="Activty"
          itemID="6"
          name="activity"
          className={
            "nav__item--container " + (nav === "activity" ? "active" : "")
          }
          onClick={handleClick}
        >
          <i className="bi bi-hexagon "></i>
          <span>Activity</span>
        </li>
        <li
          title="Settings"
          itemID="9"
          name="setting"
          className={
            "nav__item--container " + (nav === "setting" ? "active" : "")
          }
          onClick={handleClick}
        >
          <i className="bi bi-gear "></i>
          <span>Settings</span>
        </li>
        {(me.isSuperUser || me.isStaff) && (
          <li
            title="Admin Panel"
            name="admin"
            itemID="12"
            className={
              "nav__item--container " + (nav === "admin" ? "active" : "")
            }
            onClick={handleClick}
          >
            <i className="bi bi-graph-up "></i>
            <span>Admin Panel</span>
          </li>
        )}
      </ul>
    </nav>
  );
};
