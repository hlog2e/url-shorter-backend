module.exports = {
    apps : [{
        name   : "url-shorter-backend",
        exec_mode:"cluster",
        script : "./app.js",
        instances:0,
    }]
}