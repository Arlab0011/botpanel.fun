const express = require("express");
const bodyParser = require('body-parser')
var cors = require('cors')
const https = require("https");
const socketIo = require("socket.io");
const mongoose = require('mongoose');
const port = process.env.PORT || 4001;
const path = require('path');
const fs = require('fs');

const { Telegraf } = require('telegraf')
const Extra = require('telegraf/extra')
const Markup  = require('telegraf/markup')
const session = require('telegraf/session')
const bot = new Telegraf("1124035731:AAG1zLkOyJA-vy_qN4Oe0zJDvPjZPZGXSOM")

const CHANNEL_NEW_USERS = -1001435478652
const CHANNEL_DEPOSITS = -1001222576566
const CHANNEL_WITHDRAWS = -1001333825098

const withdrawRegex = /withdraw_([0-9]+)_(decline|accept)/

const axios = require('axios');
const { func } = require("prop-types");
const { RSA_NO_PADDING } = require("constants");

const ENDPOINT = "https://botpanel.fun:4001";

var privateKey = fs.readFileSync(path.resolve(__dirname+ '/openssl/server.key')).toString();
var certificate = fs.readFileSync(path.resolve(__dirname+ '/openssl/server.crt')).toString();
var ca = fs.readFileSync(path.resolve(__dirname+ '/openssl/server.ca')).toString();

const app = express();

mongoose.connect("mongodb+srv://san9:Nhn1nhn12@blin-va6kr.mongodb.net/vkapp", { useNewUrlParser: true }, function(err){
    if(err) return console.log(err);
    
    
    let http = https.createServer({
        key: privateKey,
        cert: certificate,
        ca: ca
    }, app)
    .listen(port, function(){
      console.log("Express server listening on port " + port);
    });
    
    
    app.use(bodyParser.json())
    
    
    app.use(function(req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', 'origin, content-type, accept');
        next();
    });
      
    
    var userScheme = new mongoose.Schema({
        id: { type: Number, required: true, unique: true },
        first_name: { type: String, required: true },
        last_name: { type: String, required: true },
        avatar: { type: String, required: true },
        balance: { type: Number, required: true },
        test_balance: { type: Number, required: true },
        history: { type: Array, required: true },
        usedPromo: { type: Boolean, required: true },
    }, { versionKey: false, timestamps: { createdAt: 'created_at' } })
    const User = mongoose.model("user", userScheme);
    
    
    var withdrawSchema = new mongoose.Schema({
        id: { type: Number, required: true },
        value: { type: Number, required: true },
        type: { type: String, required: true },
        wallet: { type: String, required: true },
        status: { type: Number, required: true },
    }, { versionKey: false, timestamps: { createdAt: 'created_at' } })
    const Withdraw = mongoose.model("withdraw", withdrawSchema);
    
    
    app.post('/receive', (req, res) => {
        console.log(req.body)
        let payment = req.body.payment
        if(payment && payment.status == "SUCCESS" && payment.type == "IN" && payment.sum.currency == 643) {
            let id = payment.comment
            let sum = Math.floor(payment.sum.amount * 10)
    
            console.log(id, sum)
            // deposit.makeDeposit(user_id, value, id, (deposit) => {
            //     let extra = Extra.markup(Markup.inlineKeyboard([
            //         [Markup.callbackButton('Главная страница', 'main')]
            //     ]))
    
            //     console.log(deposit)
            //     bot.telegram.sendMessage(deposit?.user_id, `Депозит #${deposit?.id} на сумму ${deposit?.value} coins произошел успешно`, extra)
    
            //     res.sendStatus(200)
            // })
        }
    })
    
    
    app.get('/api/user/:id', function(req, res){
        User.findOne({id: req.params.id}, function(err, user){
            if(err) return console.log(err);
            res.json(user)
        });
    });
    
    app.post('/api/user/', function(req, res) {
        const id = req.body.id
        const first_name = req.body.first_name
        const last_name = req.body.last_name
        const avatar = req.body.avatar
        const balance = 0
        const test_balance = 100000
        const history = []
        const usedPromo = false
    
        const user = new User({id: id, first_name: first_name, last_name: last_name, avatar: avatar, balance: balance, test_balance: test_balance, history: history, usedPromo: false});
    
        user.save()
        .then(user => {
            bot.telegram.sendMessage(CHANNEL_NEW_USERS, `ID: ${id}\nПользователь: ${first_name} ${last_name}`)
            res.json(user)
        })
    })
    
    
    
    app.post('/api/withdraw', function(req, res) {
        Withdraw.countDocuments((err, c) => {
            User.findOne({id: req.body.id})
            .then((user1) => {
                if(user1.balance >= req.body.value) {
                    user1.balance -= req.body.value
                    user1.save()
    
                    const id = c
                    const user = req.body.id
                    const value = req.body.value
                    const type = req.body.type
                    const wallet = req.body.wallet
                    const status = 0
                
                    const withdraw = new Withdraw({id: id, user: user, value: value, type: type, wallet: wallet, status: status})
                    
                    withdraw.save()
                    .then(withdraw => {
                        let extra = Extra.markup(Markup.inlineKeyboard([
                            [Markup.callbackButton('Оплата сделана', `withdraw_${id}_accept`)],
                            [Markup.callbackButton('Отменить оплату', `withdraw_${id}_decline`)]
                        ])).HTML()
    
                        bot.telegram.sendMessage(CHANNEL_WITHDRAWS, `Выплата #${id}\nПользователь: ${user}\nСумма: ${value} рублей\nТип: ${type}\nРеквизиты: ${wallet}`, extra)
                        .catch(console.error)
                        res.json(withdraw)
                    })
                } else {
                    res.json({err: 1})
                }
            }) 
        })
    })
    
    var coinSchema = new mongoose.Schema({
        id: { type: Number },
        value: { type: Number, required: true },
        test: {type: Boolean, required: true},
        player1: {
            id: { type: Number, required: true }, 
            side: { type: String, required: true },
            avatar: { type: String, required: true }
        },
        player2: {
            id: { type: Number }, 
            side: { type: String },
            avatar: { type: String }
        },
        winner: { type: Number },
        status: { type: Number, required: true },
    }, { versionKey: false, timestamps: { createdAt: 'created_at' } })
    const Coin = mongoose.model("coin", coinSchema);
    
    app.get('/api/coin', function(req, res) {
        Coin.find({status: 0})
        .then(games => {
            res.json(games)
        })
    })
    
    app.post('/api/coin/create', function(req, res) {
        Coin.countDocuments((err, c) => {
            console.log(c)
            User.findOne({id: req.body.id})
            .then((user1) => {
                console.log(user1)
                if(user1.balance >= req.body.value) {
                    user1.balance -= req.body.value
                    user1.save()
    
                    const id = c
                    const value = req.body.value
                    const side = req.body.player1.side
                    const status = 0
    
                    const coin = new Coin({
                        id: id, 
                        value: value, 
                        player1: {
                            id: user1.id, 
                            side: side, 
                            avatar: user1.avatar
                        }, 
                        status: status}
                    )
                    
                    coin.save()
                    .then(coin => res.json(coin))
                } else {
                    res.json({err: 1})
                }
            })
        })
    })
    
    app.post('/api/coin/join', function(req, res) {
        Coin.findOne({id: req.body.id})
        .then((game) => {
            console.log(game)
            if(game.player2 != {}) {
                User.findOne({id: req.body.user})
                .then((user) => {
                    if(game.value <= user.balance) {
                        user.balance -= game.value
                        user.save()
    
                        if(game.player1.side == 'red') {
                            game.player2 = {
                                id: req.body.user,
                                side: 'blue',
                                avatar: user.avatar
                            }
                        } else if(game.player1.side == 'blue') {
                            game.player2 = {
                                id: req.body.user,
                                side: 'red',
                                avatar: user.avatar
                            }
                        }
    
                        let winNumber = Math.random()
    
                        if(winNumber < 0.50) {
                            game.winner = 1
                            User.findOne({id: game.player1.id})
                            .then((user) => user.balance += game.value)
                        } else {
                            game.winner = 2
                            User.findOne({id: game.player2.id})
                            .then((user) => user.balance += game.value)
                        }
    
                        game.save()
                        .then((game) => {
                            res.json(game)
                        })
                    } else {
                        res.json({err: 2})
                    }
                })
            } else {
                res.json({err: 1})
            }
        })
    })
    
    bot.action(withdrawRegex, (msg) => {
        if(msg.match[2] == 'accept') {
            Withdraw.findOne({id: msg.match[1]})
            .then((withdraw) => {
                withdraw.status = 1
                withdraw.save()
                .then((withdraw) => bot.telegram.deleteMessage(msg.update.callback_query.message.chat.id, msg.update.callback_query.message.message_id))
            })  
        } else if(msg.match[2] == 'decline') {
            Withdraw.findOne({id: msg.match[1]})
            .then((withdraw) => {
                withdraw.status = 2
                withdraw.save()
                User.findOne({id: withdraw.user})
                .then((user) => {
                    user.balance += withdraw.value
                    user.save()
                    .then((user) => bot.telegram.deleteMessage(msg.update.callback_query.message.chat.id, msg.update.callback_query.message.message_id))
                })
            })  
        }
    })
    
    
    bot.launch()
    

    const io = socketIo(http);
    
    let interval;
    
    coinGames = [123];
    coinTestGames = [321];
    
    
    Coin.find({status: 0, test: false})
    .then(games => {
        coinGames = games
    })
    
    Coin.find({status: 0, test: true})
    .then(games => {
        coinTestGames = games
    })
    
    
    io.on("connection", (socket) => {
        console.log("New client connected");
    
        socket.on('subscribe', function(room) { 
            console.log('joining room', room);
            socket.join(room); 
            switch(room) {
                case 'coin':
                    io.in("coin").emit('coinGames', coinGames);
                break;
                case 'coinTest':
                    io.in("coinTest").emit('coinGames', coinTestGames)
                break;
            }
        })
    
        socket.on('unsubscribe', function(room) { 
            console.log('leave room', room);
            socket.leave(room)
        })
    
        socket.on('updateUser', function (data) {
            console.log(data)
            setTimeout(() => updateUser(socket, data), 1000)
        });
    
        socket.on('coinCreate', function (data) {
            coinCreate(socket, data)
            io.in("coin").emit('coinGames', coinGames);
        })
    
        socket.on('coinTestCreate', function (data) {
            coinCreate(socket, data)
            io.in("coin").emit('coinGames', coinGames);
        })
    
        socket.on('coinJoin', function (data) {
            coinJoin(socket, data)
            io.in("coin").emit('coinGames', coinGames);
        })
    
    
        socket.on("getPromo", function (data) {
            User.findOne({id: data})
            .then((user) => {
                if(user.usedPromo == false) {
                    user.usedPromo = true
                    user.test_balance += 100000
                    user.save()
                    .then((user) => updateUser(socket, data))
                }
            })
        })
    
        socket.on("disconnect", () => {
            console.log("Client disconnected");
            clearInterval(interval);
        });
    });
    
    
    
    const updateUser = (socket, id) => {
        console.log(id)
        User.findOne({id: id})
        .then((user) => {
            setTimeout(() => socket.emit('updatedUser', user), 1000)
        })  
    }
    
    const coinCreate = (socket, data) => {
        Coin.countDocuments((err, c) => {
            console.log(c)
            User.findOne({id: data.id})
            .then((user) => {
                if(data.test == false) {
                    if(user.balance >= data.value) {
                        user.balance -= data.value
                        user.save()
        
                        const id = c
                        const value = data.value
                        const side = data.player1.side
                        const status = 0
        
                        const coin = new Coin({
                            id: id, 
                            value: value, 
                            test: data.test,
                            player1: {
                                id: user.id, 
                                side: side, 
                                avatar: user.avatar
                            }, 
                            status: status}
                        )
                        updateUser(socket, user.id)
                        coin.save()
                        .then((coin) => {
                            coinGames.push(coin)
                            socket.emit('coinCreated', coinGames)
                        })
                    } else {
                        socket.emit('coinCreateError', 1)
                    }
                } else {
                    console.log(123)
                    if(user.test_balance >= data.value) {
                        user.test_balance -= data.value
                        user.save()
        
                        const id = c
                        const value = data.value
                        const side = data.player1.side
                        const status = 0
        
                        const coin = new Coin({
                            id: id, 
                            test: data.test,
                            value: value, 
                            player1: {
                                id: user.id, 
                                side: side, 
                                avatar: user.avatar
                            }, 
                            status: status}
                        )
                        updateUser(socket, user.id)
                        coin.save()
                        .then((coin) => {
                            coinTestGames.push(coin)
                            socket.emit('coinCreated', coinTestGames)
                        })
                    } else {
                        socket.emit('coinCreateError', 1)
                    }
                }
            })
        })
    }
    
    const coinJoin = (socket, data) => {
        Coin.findOne({id: data.id})
            .then((game) => {
                console.log(game)
                if(game.player2 != {}) {
                    User.findOne({id: data.user})
                    .then((user) => {
                        if(game.test == false) {
                            if(user.balance >= game.value) {
                                user.balance -= game.value
                                user.save()
                                .then((user) => {
                                    updateUser(socket, user.id)
        
                                    if(game.player1.side == 'red') {
                                        game.player2 = {
                                            id: data.user,
                                            side: 'blue',
                                            avatar: user.avatar
                                        }
                                    } else if(game.player1.side == 'blue') {
                                        game.player2 = {
                                            id: data.user,
                                            side: 'red',
                                            avatar: user.avatar
                                        }
                                    }
            
                                    let winNumber = Math.random()
            
                                    console.log(winNumber)
            
                                    if(winNumber < 0.50) {
                                        console.log(1)
                                        game.winner = 1
                                        User.findOne({id: game.player1.id})
                                        .then((user) => {user.balance += game.value + game.value; user.save()})
                                    } else {
                                        console.log(2)
                                        game.winner = 2
                                        User.findOne({id: game.player2.id})
                                        .then((user) => {user.balance += game.value + game.value; user.save()})
                                    }
            
                                    game.save()
                                    .then((game) => {
                                        for (let i = 0; i < coinGames.length; i++) {
                                            if(coinGames[i].id == game.id) {
                                                coinGames[i] = game
                                                console.log(i)
                                                setTimeout(() => {
                                                    coinGames.splice(i, 1)
                                                    game.status = 1
                                                    game.save()
                                                    io.in("coin").emit('coinGames', coinGames);
                                                }, 10000)
                                            }
                                        }
            
                                        socket.emit('coinJoined', coinGames)
                                    })
                                })
                            } else {
                                socket.emit('coinJoinedError', 2)
                            }
                        } else {
                            if(user.test_balance >= game.value) {
                                user.test_balance -= game.value
                                user.save()
                                .then((user) => {
                                    updateUser(socket, user.id)
        
                                    if(game.player1.side == 'red') {
                                        game.player2 = {
                                            id: data.user,
                                            side: 'blue',
                                            avatar: user.avatar
                                        }
                                    } else if(game.player1.side == 'blue') {
                                        game.player2 = {
                                            id: data.user,
                                            side: 'red',
                                            avatar: user.avatar
                                        }
                                    }
            
                                    let winNumber = Math.random()
            
                                    console.log(winNumber)
            
                                    if(winNumber < 0.50) {
                                        console.log(1)
                                        game.winner = 1
                                        User.findOne({id: game.player1.id})
                                        .then((user) => {user.test_balance += game.value + game.value; user.save()})
                                    } else {
                                        console.log(2)
                                        game.winner = 2
                                        User.findOne({id: game.player2.id})
                                        .then((user) => {user.test_balance += game.value + game.value; user.save()})
                                    }
            
                                    game.save()
                                    .then((game) => {
                                        for (let i = 0; i < coinTestGames.length; i++) {
                                            if(coinTestGames[i].id == game.id) {
                                                coinTestGames[i] = game
                                                console.log(i)
                                                setTimeout(() => {
                                                    coinTestGames.splice(i, 1)
                                                    game.status = 1
                                                    game.save()
                                                    io.in("coin").emit('coinGames', coinTestGames);
                                                }, 10000)
                                            }
                                        }
            
                                        socket.emit('coinJoined', coinTestGames)
                                    })
                                })
                            } else {
                                socket.emit('coinJoinedError', 2)
                            }
                        }
                    })
                } else {
                    socket.emit('coinJoinedError', 1)
                }
            })
    }
});
