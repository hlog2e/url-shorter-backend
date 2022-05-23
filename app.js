const express = require("express");
const app = express();
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");

//express init
app.use(express.json());
app.use(morgan());
app.use(helmet());
app.use(cors());

//라우터
const urlRouter = require("./routers/url");
app.use("/url", urlRouter);

//에러 핸들링
app.use((req, res, next) => {
  res.status(404).send({ status: 404, message: "올바르지 않은 접근입니다." });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send({ status: 500, message: "internal error" });
});

app.listen("3001", "0.0.0.0", () => {
  console.log("on 3001");
});
