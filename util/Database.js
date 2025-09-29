const sqlite3 = require('sqlite3').verbose();

class Database {
    constructor() {
        this.db = new sqlite3.Database('./database.db', (err) => {
            if (err) {
                console.error("[자석이] 오류, DB 연결 실패 : ", err.message);
            }
        });
    }

    init() {
        this.db.run(`
        CREATE TABLE IF NOT EXISTS musicChannel (
            guildId   TEXT PRIMARY KEY,
            channelId TEXT NOT NULL,
            messageId TEXT NOT NULL
        )`, (err) => {
            if (err) {
                console.error("[자석이] DB 초기화 실패 : ", err.message);
            } else {
                console.log("[자석이] DB 초기화 성공");
            }
            this.close();
        });
    }

    close() {
        this.db.close((err) => {
            if (err) {
                return console.error("[자석이] DB 닫기 실패 :", err.message);
            }
        });
    }

    save(guildId, channelId, messageId) {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO musicChannel (guildId, channelId, messageId) VALUES (?, ?, ?)`;
            const values = [guildId, channelId, messageId];

            this.db.run(sql, values, function(err) {
                if (err) {
                    console.error("[자석이] 데이터 저장 실패 : ", err.message);
                    reject(err);
                }
                console.log(`[자석이] 음악채널 저장 완료 (서버 ID : ${guildId}, 행 번호 : ${this.lastID})`);
                resolve(this.lastId);
            });
        })
    }

    get(guildId) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM musicChannel WHERE guildId = ?`;
            this.db.get(sql, [guildId], (err, row) => {
                if (err) {
                    console.error("[자석이] 데이터 조회 실패 :", err.message);
                    reject(err);
                }
                resolve(row);
            });
        })
    }

    edit(guildId, channelId, messageId) {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE musicChannel SET channelId = ?, messageId = ? WHERE guildId = ?`;
            const values = [channelId, messageId, guildId];

            this.db.run(sql, values, function(err) {
                if (err) {
                    console.error("[자석이] 데이터 수정 실패 : ", err.message);
                    reject(err);
                }
                console.log(`[자석이] 데이터 수정 완료 (서버 ID : ${guildId}, 변경된 행 : ${this.changes})`);
                resolve(this.changes);
            });
        });
    }

    delete(guildId) {
        return new Promise((resolve, reject) => {
            const sql = `DELETE FROM musicChannel WHERE guildId = ?`;
            this.db.run(sql, [guildId], function(err) {
                if (err) {
                    console.error("[자석이] 데이터 삭제 실패 : ", err.message);
                    reject(err);
                }
                console.log(`[자석이] 음악채널 삭제 완료 (서버 ID : ${guildId}, 삭제된 행 수 : ${this.length})`);
                resolve(this.length);
            });
        });
    }
}

module.exports = Database;