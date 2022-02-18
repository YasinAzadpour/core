const Message = ({ message, user, me }) => {
  const isMe = message.sender_id == me.id;
  const time = message.time.split("T")[1].split(".")[0].slice(0, -3);
  return (
    <div
      className={
        "message  flex w-full py-1 last:mb-16 first:mt-[10vh] " +
        (isMe ? "justify-end" : "")
      }
      id={isMe ? "me" : "other"}
    >
      {message.image ? (
        <img
          src={message.image}
          loading="lazy"
          className="w-[70%] rounded-2xl"
          title={`${isMe ? "You" : user.name} • ${time}`}
        />
      ) : (
        <div className="max-w-[80%]">
          <p
            className="rounded-2xl text-sm py-2 px-4 whitespace-pre-wrap break-words"
            dir="auto"
            id="text"
            title={`${isMe ? "You" : user.name} • ${time}`}
          >
            {message.text}
          </p>
        </div>
      )}
    </div>
  );
};

const Item = ({ user, func }) => {
  return (
    <div
      className="flex items-center cursor-pointer relative h-20 py-3 px-2 hover:bg-[#1e1e1e]"
      onClick={() => func(user)}
    >
      <div className="active-user relative">
        <div className="overflow-hidden aspect-square h-14 rounded-full">
          <img
            src={user.profile || ""}
            alt={`${user.name}'s profile"`}
            loading="lazy"
          />
        </div>
      </div>

      <div className="flex flex-col justify-center h-full w-[60%] ml-2">
        <span className="mb-1 truncate text-xl">{user.name}</span>
        <span className="opacity-50 text-xs truncate">{user.bio}</span>
      </div>

      <p className="absolute opacity-60 right-0 top-0 max-w-[20%] m-2 text-xs truncate">
        {user.category}
      </p>
    </div>
  );
};

const ChatSection = () => {
  const [searchResult, setSearchResult] = useState([]);
  const [isSearch, setIsSearch] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [user, setUser] = useState();
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState([]);
  const [chatSocket, setChatSocket] = useState();

  const me = useContext(MyDataContext);
  const onMessage = (e) => {
    const newMessages = JSON.parse(e.data);
    setConversation((r) => [...r, newMessages]);
  };
  const join = (url) => {
    setChatSocket(() => {
      const ws = new WebSocket(url);
      ws.onmessage = onMessage;
      return ws;
    });
  };

  const switchChat = () => {
    $("#navbar").toggleClass("hidde");
    $("#chatView #chatContainer ").toggleClass("active");
  };

  const handleSearch = (e) => {
    if (e.target.value) {
      setIsLoading(true);
      $.ajax({
        method: "POST",
        url: "/api/accounts/search",
        data: {
          text: e.target.value,
          csrfmiddlewaretoken: me.csrfmiddlewaretoken,
        },
        success: (r) => {
          setSearchResult(r.data);
          setIsLoading(false);
        },
      });
    }
  };

  const messageText = (e) => {
    const text = e.target.value;
    setMessage(text);
    let lines = text.replace(/[^\n]/g, "").length;
    lines = lines > 5 ? 5 : lines;
    lines = lines == 1 ? 2 : lines;
    lines = lines == 0 ? 1 : lines;
    e.target.style.height = lines * 2 + "rem";
  };

  const handleSendMessage = (e) => {
    chatSocket.send(JSON.stringify({ text: message }));
    e.target.offsetParent.children[0].value = "";
    setMessage("");
    messageText({ target: e.target.offsetParent.children[0] });
  };

  const handleClick = (user) => {
    setConversation([]);
    setUser(user);
    switchChat();
    setIsSearch(false);
    setSearchResult([]);
    join(`ws://${window.location.host}/ws/chat/${user.id}/`);
    setMessagesLoading(true);
    $.ajax({
      method: "POST",
      url: `/api/chat/messages/${user.id}`,
      data: {
        csrfmiddlewaretoken: me.csrfmiddlewaretoken,
      },
      success: (r) => {
        if(r.result == "ok"){
          setConversation(r.data);
          setMessagesLoading(false);
        }
      },
    });
  };

  return (
    <section className="mainContainer active" id="chatView">
      <div
        className="absolute right-0  w-full lg:h-full lg:relative lg:w-[50%] h-[90vh] overflow-hidden flex flex-col  bg-[var(--dark)] border-r-[1px] border-r-[#ffffff0d]"
        id="listContainer"
      >
        <div
          className={
            "absolute overflow-hidden bg-[#131313] top-0 w-full h-full z-[1] opacity-0 pointer-events-none translate-y-[-3rem] " +
            (isSearch ? "show" : "")
          }
        >
          <div className="flex items-center justify-center m-1 p-1 h-[7vh]">
            <i
              className="bi bi-x text-xl m-1 hover:rotate-90"
              onClick={() => setIsSearch(false)}
            ></i>
            <input
              className="text-base mx-1 w-full bg-transparent focus:border-none focus:outline-none focus-visible:border-none focus-visible:outline-none"
              placeholder="Search..."
              onChange={handleSearch}
            />
          </div>
          <div
            className={
              "overflow-y-auto overflow-x-hidden w-full h-full " +
              (isLoading || !searchResult ? "center" : "")
            }
          >
            {isLoading ? (
              <p>Loading...</p>
            ) : searchResult ? (
              searchResult.map((user) => (
                <Item user={user} key={user.id} func={handleClick} />
              ))
            ) : (
              <p>Sorry! result not found.</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between w-full h-[7vh] p-2">
          <h1 className="text-2xl">Chats</h1>
          <i
            className="bi bi-search text-xl"
            onClick={() => setIsSearch(true)}
          ></i>
        </div>
        <div className="overflow-y-auto overflow-x-hidden w-full h-full"></div>
      </div>

      <div
        className="absolute h-full -right-[100%] lg:right-0 opacity-0 lg:opacity-100 lg:relative overflow-hidden bg-[var(--dark)] w-full "
        id="chatContainer"
      >
        {user && (
          <div className="absolute top-0 w-full h-[10vh] flex justify-start items-center pl-12 pr-24 bg-[#131313cc] backdrop-blur-md ">
            <i
              id="close"
              title="Back"
              className="bi bi-chevron-left p-3 lg:opacity-0 lg:pointer-events-none flex absolute left-0 text-2xl"
              onClick={switchChat}
            ></i>
            <div
              className={
                "relative h-[80%] aspect-square " +
                (user.status ? "active-user" : "")
              }
            >
              <div className="rounded-full h-full w-full overflow-hidden">
                <img src={user.profile} alt={`${user.name}'s profile`} />
              </div>
            </div>
            <div className="m-2 w-100">
              <h5 className="truncate text-2xl">{user.name}</h5>
              <span className="text-sm opacity-60">{user.status}</span>
            </div>
            <i
              className="bi bi-info-circle-fill p-3 absolute right-0 text-2xl"
              title="Show more"
              id="more"
            ></i>
          </div>
        )}
        {user && (
          <div className={"w-full h-full p-2 overflow-y-auto overflow-x-hidden bg-[#131313] " + (!conversation ||messagesLoading ?"center":"")}>
            {messagesLoading ? (
              <p>Loading...</p>
            ) : conversation ? (
              conversation.map((msg) => (
                <Message message={msg} user={user} key={msg.id} me={me} />
              ))
            ) : (
              <p>You don't have any message.</p>
            )}
          </div>
        )}

        {user && (
          <div
            className="w-[98%] max-h-[30%] rounded-3xl absolute bottom-0 flex items-center justify-center overflow-hidden bg-[#131313cc] border-[1px] border-[#ffffff0d] m-2 p-1 pl-[.15rem] backdrop-blur-md"
            id="messageInputContainer"
          >
            {!message.replace(/\s/g, "") && (
              <div className="group flex w-8 hover:w-[8rem]" id="options">
                <i
                  className="bi bi-plus-lg group-hover:-rotate-45 rounded-full p-2 flex items-center justify-center relative border-[1px] border-[#ffffff0d]"
                  title="Show options"
                ></i>

                <i
                  className="bi bi-image-fill scale-0 translate-x-[-3rem] group-hover:translate-x-0 group-hover:scale-100  rounded-full p-2 flex items-center justify-center relative border-[1px] border-[#ffffff0d]"
                  title="Send image"
                >
                  <input
                    placeholder="Send an image"
                    type="file"
                    id="image"
                    accept="image/*"
                    name="sendImage"
                    onChange={handleSendMessage}
                    className="opacity-0 w-[2rem] h-[2rem] z-[2] absolute top-0 left-0 cursor-pointer"
                  />
                </i>

                <i
                  className="bi bi-mic scale-0 translate-x-[-3rem] group-hover:translate-x-0 group-hover:scale-100 rounded-full p-2 flex items-center justify-center relative border-[1px] border-[#ffffff0d]"
                  title="Send voice"
                  id="voiceBtn"
                ></i>
              </div>
            )}
            <textarea
              onChange={messageText}
              type="text"
              id="text"
              placeholder="Type a message ..."
              className="h-[2rem] px-2 py-1 w-full resize-none overflow-hidden bg-transparent focus:border-none focus:outline-none focus-visible:border-none focus-visible:outline-none text-base"
              dir="auto"
            ></textarea>
            {message.replace(/\s/g, "") && (
              <button
                className="bg-transparent p-1 cursor-pointer text-base text-[#6909dd]"
                onClick={handleSendMessage}
              >
                Send
              </button>
            )}
          </div>
        )}

        {!user && (
          <p className="w-100 h-100 center">Please select an item...</p>
        )}
      </div>
    </section>
  );
};
