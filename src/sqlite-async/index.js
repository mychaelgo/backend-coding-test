/* global db */
const getAsync = (sql, values) => new Promise((resolve, reject) => {
    db.all(sql, values, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
    });
});

const insertAsync = (sql, values) => new Promise((resolve, reject) => {
    db.run(sql, values, function (err) {
        if (err) reject(err);
        resolve(this.lastID);
    });
});

module.exports = {
    getAsync,
    insertAsync
};
