const express = require("express");
const router = express.Router();

const mariaDB = require("../database/maria");
mariaDB.connect();

router.get("/:alias", (req, res, next) => {
  console.log(req.params.alias);
  mariaDB.query(
    "select origin_url from urls where alias = ?;",
    req.params.alias,
    (err, rows, fields) => {
      if (err) {
        res.status(400).send({ status: 400, message: "잘못된 요청입니다." });
        console.error(err);
      } else {
        if (rows.length) {
          //res.send({ origin_url: rows[0].origin_url });
          res.redirect(rows[0].origin_url);
        } else {
          /*res
            .status(404)
            .send({ status: 404, message: "존재하지 않는 URL 입니다." });
            */
          res.redirect("/notfound.html");
        }
      }
    }
  );
});
router.post("/", (req, res, next) => {
  if (
    !req.body.origin_url.startsWith("http://") &&
    !req.body.origin_url.startsWith("https://")
  ) {
    req.body.origin_url = "http://" + req.body.origin_url;
  }
  if (req.body.alias) {
    next();
  } else {
    //alias 미 지정시 6자 랜덤 단어 생성
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let randomChar = "";

    for (let i = 0; i < 6; i++) {
      randomChar += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    req.body.alias = randomChar;
    next();
  }
});
router.post("/", (req, res, next) => {
  mariaDB.query(
    "insert into urls(origin_url, alias, origin_ip) values(?,?,?)",
    [
      req.body.origin_url,
      req.body.alias,
      req.headers["x-forwarded-for"] || req.socket.remoteAddress,
    ],
    (err, rows, fields) => {
      if (err) {
        if (err.code == "ER_DUP_ENTRY") {
          res.status(400).send({ status: 400, message: "중복된 URL 입니다." });
        } else {
          res.status(400).send({ status: 400, message: "잘못된 요청입니다." });
          console.error(err);
        }
      } else {
        res.status(200).send({
          status: 200,
          message: "URL이 정상적으로 생성되었습니다.",
          alias: req.body.alias,
          origin_url: req.body.origin_url,
        });
      }
    }
  );
});

module.exports = router;
