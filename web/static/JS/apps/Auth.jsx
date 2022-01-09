const Auth = () => {
  const details = {
    signIn: {
      header: "SignIn",
      detail: "SignIn into your account.",
      apiUrl: "/api/accounts/sign-in",
      pageUrl: "/accounts/sign-in",
    },
    signUp: {
      header: "SignUp",
      detail: "Create a new account.",
      apiUrl: "/api/accounts/sign-up",
      pageUrl: "/accounts/sign-up",
    },
    setUp: {
      header: "Setup your profile",
      detail: "You can set a profile image and your a name.",
      apiUrl: "/api/accounts/edit",
    },
    finall: {
      header: "Welcome",
    },
  };

  const [form, setForm] = useState(initialForm);
  const [formStatus, setFormStatus] = useState({});
  const [formState, setFormState] = useState(pageName);
  const [title, setTitle] = useState(details[pageName]);
  const [isLoading, setIsLoading] = useState(false);
  const [canSend, setCanSend] = useState(false);

  const handleChange = (e) => {
    e.target.value =
      e.target.name == "username"
        ? e.target.value.toLowerCase()
        : e.target.value;
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const menu = () => {
    setFormState("menu");
    setFormStatus({});
    setForm(initialForm);
    setIsLoading(false);
  };

  const handleClickOption = (e) => {
    const name = e.currentTarget.name;
    changePage(details[name]["header"], details[name]["pageUrl"]);
    setTitle(details[name]);
    setFormState(name);
  };

  const AuthItem = ({ name }) => {
    return (
      <a
        className="auth__container-form--options"
        onClick={handleClickOption}
        name={name}
      >
        <h4 id="title">{details[name]["header"]}</h4>
        <p id="details">{details[name]["detail"]}</p>
      </a>
    );
  };

  const handleSetProfile = (e) => {
    const [file] = e.target.files;
    setForm({ ...form, ["profile"]: file });
    $("#profileImage").removeClass("none");
    $("#profileImage").css(
      "background-image",
      `url(${URL.createObjectURL(file)})`
    );
  };

  const handleNext = () => {
    const data = new FormData();
    data.append("profile", form.profile || "");
    data.append("name", form.name || "");
    data.append("category", form.category || "");
    data.append("csrfmiddlewaretoken", form.csrfmiddlewaretoken);
    $.ajax({
      method: "POST",
      url: details["setUp"]["apiUrl"],
      data: data,
      contentType: false,
      processData: false,
      success: (r) => {
        setFormStatus(r);
        if (r.result === "ok") {
          setFormState("finall");
          setTitle(details["finall"]);
          setTimeout(() => {
            document.location.href = "/";
          }, 2000);
        }
      },
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormStatus({});
    if (formState === "signUp") {
      setIsLoading(true);
      $.ajax({
        method: "POST",
        url: details["signUp"]["apiUrl"],
        data: form,
        success: (r) => {
          setIsLoading(false);
          if (r.result == "ok") {
            setForm({
              ...form,
              ["csrfmiddlewaretoken"]: r.csrfmiddlewaretoken,
            });
            setFormState("setUp");
            setTitle(details["setUp"]);
          }
          setFormStatus(r);
        },
      });
    } else if (formState === "signIn") {
      setIsLoading(true);
      $.ajax({
        method: "POST",
        url: details["signIn"]["apiUrl"],
        data: form,
        success: (r) => {
          setFormStatus(r);
          setIsLoading(false);
          if (r.result === "ok") {
            document.location = "/";
          }
        },
      });
    }
  };

  useEffect(() => {
    setFormStatus({});
    setCanSend(
      (formState === "signIn" && form.username && form.password) ||
        (formState === "signUp" && form.email && form.username && form.password)
    );
  }, [form]);

  return (
    <div
      className={
        "auth__container-form--wrapper col-md-11 col-lg-6 " +
        (formState === "menu" ? "" : "px-3")
      }
    >
      {formState !== "menu" && (
        <div className="auth__container-form--title pb-3">
          <h3>{title.header}</h3>
          <h6>{title.detail}</h6>
        </div>
      )}
      {form.name && formState === "setUp" && (
        <i
          className="bi bi-chevron-right auth__container--next-key"
          onClick={handleNext}
        ></i>
      )}
      {["setUp", "finall"].includes(formState) && (
        <div className="auth__container--setup__container">
          <div
            className={
              "auth__container--setprofile__contianer " +
              (formStatus.profile ? "invalid" : "")
            }
          >
            {formState === "setUp" && (
              <input
                type="file"
                accept="image/*"
                name="profile"
                onChange={handleSetProfile}
                title={
                  (form.profile ? "Change" : "Set") + " your profile image"
                }
              />
            )}
            <img alt="Image Preview" id="profileImage" className="none" />
          </div>
          <div
            className={
              "auth__container-form--input m-0 " +
              (formStatus.name ? "invalid" : "")
            }
          >
            <input
              type="text"
              placeholder="Your Name"
              name="name"
              autoComplete="name"
              maxLength="50"
              onChange={handleChange}
              id="name"
              disabled={formState === "finall"}
            />
          </div>
          {((formState === "finall" && form.category) ||
            formState === "setUp") && (
            <div
              className={
                "auth__container-form--input m-0 " +
                (formStatus.category ? "invalid" : "")
              }
            >
              <input
                type="text"
                placeholder="Category"
                name="category"
                autoComplete="none"
                maxLength="30"
                onChange={handleChange}
                id="category"
                disabled={formState === "finall"}
              />
            </div>
          )}
        </div>
      )}

      {!["menu", "setUp", "finall"].includes(formState) && (
        <form method="POST" onSubmit={handleSubmit}>
          <div
            className={
              "auth__container-form--input " +
              (formStatus.username ? "invalid" : "")
            }
          >
            <input
              type="text"
              placeholder="Username"
              name="username"
              autoComplete="username"
              maxLength="30"
              spellCheck="false"
              pattern="^(?!.*\.\.)(?!.*\.$)[a-z0-9][a-z0-9_.]{2,29}$"
              onChange={handleChange}
            />
            <span className="error">
              {formStatus.username || "Username is unavailble !"}
            </span>
          </div>
          <div
            className={
              "auth__container-form--input " +
              (formStatus.password ? "invalid" : "")
            }
          >
            <input
              type="password"
              placeholder="Password"
              name="password"
              pattern={formState === "signUp" ? ".{8,}" : ".*"}
              autoComplete={
                formState === "signUp" ? "new-password" : "current-password"
              }
              onChange={handleChange}
            />
            <span className="error">
              {formStatus.password || "Password is too short !"}
            </span>
          </div>
          {formState === "signUp" && (
            <div
              className={
                "auth__container-form--input " +
                (formStatus.email ? "invalid" : "")
              }
            >
              <input
                placeholder="Email"
                type="email"
                name="email"
                autoComplete="email"
                onChange={handleChange}
              />
              <span className="error">
                {formStatus.email || "Invalid email!"}
              </span>
            </div>
          )}
          <button
            type="submit"
            className="auth__container--submit__btn"
            disabled={!canSend}
          >
            {isLoading ? <Loading /> : title.header}
          </button>

          <button className="auth__container--help__btn" onClick={menu}>
            Help me
          </button>
        </form>
      )}
      {formState === "menu" && (
        <div>
          <AuthItem name="signIn" />
          <AuthItem name="signUp" />
        </div>
      )}
    </div>
  );
};
