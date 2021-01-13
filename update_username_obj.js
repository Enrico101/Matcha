//checked
var db = require('./database');

function update_username(table_name, location, user_id, new_username) {
    this.table_name = table_name,
    this.location = location,
    this.user_id = user_id,
    this.new_username = new_username,
    this.update = function() {
        db.query("SELECT * FROM "+this.table_name+" WHERE "+this.location+" = ?", [this.username], (err, data) => {
            if (err)
                console.log(err);
            else if (data.length > 0)
            {
                db.query("UPDATE "+this.table_name+" SET "+this.location+" = ? WHERE "+this.location+" = ?", [this.new_username, this.username], (err, succ) => {
                    if (err)
                        console.log(err);
                    else
                        console.log("Succesfully updated "+this.table_name+" table");
                });
            }
            else
                console.log("No changes to make!");
        })
    }
}

module.exports = update_username;