/**
 * db 负责操作数据库
 */

const mysql = require('mysql');
exports.base = (sql,data,callback) => {
    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'zxg'
    });

    connection.connect();

    connection.query(sql, data,function (error, results) {
        if (error) throw error;
        callback(results)
    });

    connection.end();
}