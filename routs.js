const path = require('path');
const moment = require('moment');


module.exports = function (app, todos, fs, database, crypto) {


    // app.get('*', function (req, res) {
    //     res.sendFile(path.join(__dirname,'todo.html'))
    //   });
    app.get('/', function (req, res) {
        if(req.session.email) {

            todos = todos.filter(function( obj ) {
                // console.log(">>>> " + obj.userid + " >>>> " + req.session.userid);
                return obj.userid === req.session.userid;
            });

            // get the count of non-empty elements  
            var count = todos.filter(function(value) {return value !== undefined}).length;

            if(count === 0){
                req.flash('empty', 'Please add your first to do.');
            }
            else{
                req.flash('empty', '');
            }

        res.sendFile(path.join(__dirname, 'views', 'index.html'), {message: req.flash('empty'), moment: moment, title:"Todos", todos: todos, count:count, username: req.session.username, userid: req.session.userid})
    }
    else res.redirect('/login');
    });

    app.get('/get-todos', function (req, res) {
        uid = req.session.userid;
        todos = [];
        database.query(
            `SELECT * FROM todos WHERE userid = ${uid}`,
            function (error, results, fields) {

                if (error) throw error;

                console.log('results: ', results);

                res.send(results)
            });
    });
    app.get('/get-todos-false', function (req, res) {
        database.query(
            `SELECT * FROM todos WHERE complete = 0`,
            function (error, results, fields) {

                if (error) throw error;

                console.log('results: ', results);

                res.send(results)
            });
    });

    app.get('/get-todos-true', function (req, res) {
        database.query(
            `SELECT * FROM todos WHERE complete = 1`,
            function (error, results, fields) {

                if (error) throw error;

                console.log('results: ', results);

                res.send(results)
            });
    });

    app.get('/get-todo/:id', function (req, res) {
        let id = req.params.id;
        database.query(
            `SELECT * FROM todos WHERE id = ${id};`,
            function (error, results, fields) {

                if (error) throw error;

                console.log('results: ', results);

                res.send(results)
            });
    });
    app.post('/update-todo', function (req, res) {
        let id = req.body.id;
        let complete = req.body.complete;
        let donedatetime = complete ? moment().format('YYYY-MM-DD HH:mm:ss') : null;
        
        database.query(
            `UPDATE todos SET complete=${complete}, donedatetime = '${donedatetime}' WHERE id = ${id};`,
            function (error, results, fields) {

                if (error) throw error;

                console.log('results >>>>>>>>>>>>>> ', results);

                res.send({
                    ...results,
                    donedatetime: donedatetime
                })
            });
    });

    app.post('/edit-todo', function (req, res) {
        let id = req.body.id;
        let text = req.body.text;
        database.query(
            `UPDATE todos SET text='${text}' WHERE id = ${id};`,
            function (error, results, fields) {

                if (error) throw error;

                console.log('results: ', results);

                res.send(results)
            });
    });
    app.delete('/delete-todo', function (req, res) {
        let id = req.body.id;
        database.query(
            `DELETE FROM todos WHERE id = ${id};`,
            function (error, results, fields) {

                if (error) throw error;

                console.log('results: ', results);

                res.send(results)
            });
    });
    app.put('/create-todo', function (req, res) {
        let text = req.body.text;
        let userid = req.query.userid;

        let created = moment().format("YYYY-MM-DD HH:mm:ss");
        database.query(
            `INSERT INTO todos (text, created, userid) VALUES ('${text}', '${created}', '${userid}');`,
            function (error, result, fields) {

                if (error) throw error;

                console.log('results: ', result);

                res.send(result)
            });
    });
}

//
    // sign up, login and logout a user
    //
    app.get('/login', function(req, res){
        res.render('login', {title: "Login", hideLogin: true, error:req.query.error});
    });
    app.get('/login-submit', function(req, res){
        // test if user/pass exist in the database
        var passhash = crypto.createHash('md5').update(req.query.pass).digest('hex');
        var sql = "SELECT * FROM users WHERE email='"+req.query.email+"' AND password='"+passhash+"'";
        database.query(sql, function(err, rows){
            // if exist, create session and redirect to home
            if(rows.length > 0) {
                //put values in session
                //since there should only be one matching record assign username and id to session for reference
                req.session.email = req.query.email;
                req.session.username = rows[0].username;
                req.session.userid = rows[0].id;
                // console.log("username " + req.session.username);
                res.redirect('/');
                
            // if do not exist, redirect to login page
            } else {
                res.redirect('/login?error=true');
            }
        });
    });

    app.get('/signup', function(req, res){
        res.render('signup', {title: "Sign-Up", hideLogin: true, error:req.query.error});
    });

    app.get('/signup-submit', function(req, res){
        // test if user/pass exist in the database
        var passhash = crypto.createHash('md5').update(req.query.pass).digest('hex');
        var sql = "SELECT * FROM users WHERE email='"+req.query.email+"' AND password='"+passhash+"'";
        
        database.query(sql, function(err, rows){
            // if error, close database connection and console log error
            if(err) {
                // database.end();
                res.redirect('/login?error=true');
                return console.log(err);
            }

            // if record does not exist, insert new user in database
            if (!rows.length)
            {
                // console.log("no rows " + rows.length);
                var sql = "INSERT INTO users (username, password, name, email) VALUES ('"+req.query.user+"', '"+passhash+"', '"+req.query.name+"', '"+req.query.email+"')";
                database.query(sql,function(err, results){
                    if(err) {
                        // database.end();
                        return console.log(err);
                    }
                    else
                    {
                        // console.log("results " + results);
                        res.redirect('/login');
                    }
                });
            }
            else
            {
                // if user exists, redirect to sign in page and present user exists message
                // database.end();
                res.redirect('/login');
            }
        });
    });

    app.get('/logout-submit', function(req, res){
        req.session.email = false;
        res.redirect('/login');
    });