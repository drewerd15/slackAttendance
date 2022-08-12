const PORT = process.env.PORT || 8080;
const app = require("./app");
const init = async () => {
  try {
    app.listen(PORT, () => console.log("I'm awake!"));
  } catch (e) {
    next(e);
  }
};

init();
