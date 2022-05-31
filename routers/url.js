const express = require("express");
const router = express.Router();
const requestIp = require("request-ip");
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
          res.redirect("/notfound");
        }
      }
    }
  );
});
router.post("/", (req, res, next) => {
  //Long Url 의 유효성 검사 로직
  const urlRegex =
    /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
  if (!urlRegex.test) {
    res.status(400).send({
      status: 400,
      message: "단축할 URL 주소가 올바르지 않은 형식입니다.",
    });
  } else {
    next();
  }
});
router.post("/", (req, res, next) => {
  //Alias 미 지정시 랜덤한 6자 영단어 생성 로직
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
  //최종적인 DB Insert 로직
  const reqIP = requestIp.getClientIp(req);
  mariaDB.query(
    "insert into urls(origin_url, alias, origin_ip) values(?,?,?)",
    [req.body.origin_url, req.body.alias, reqIP],
    (err, rows, fields) => {
      if (err) {
        if (err.code == "ER_DUP_ENTRY") {
          res
            .status(400)
            .send({ status: 400, message: "이미 사용 중인 URL 주소입니다." });
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
