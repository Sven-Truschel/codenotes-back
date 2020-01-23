const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const Notes = require('../models/note')

router.post('/signup', (req, res, next) => {
    User.find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length >= 1) {
                return res.status(422).json({
                    message: 'Email already in use..'
                });
            } else {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            error: err
                        });
                    } else {
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            email: req.body.email,
                            username: req.body.username,
                            password: hash

                        });
                        user
                            .save()
                            .then(result => {
                                console.log(result);
                                res.status(201).json({
                                    message: 'User created!'
                                })
                            })
                            .catch(err => {
                                console.log(err);
                                res.status(500).json({
                                    error: err
                                })
                            });
                    }
                });
            }
        })
});

router.post('/login', (req, res, next) => {
    User.find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length < 1) {
                return res.status(401).json({
                    message: 'Authorization failed..'
                });
            }
            bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                if (err) {
                    return res.status(401).json({
                        message: 'Authorization failed..'
                    });
                }
                if (result) {
                    const token = jwt.sign({
                            email: user[0].email,
                            userId: user[0]._id
                        },
                        process.env.JWT_KEY, {
                            expiresIn: "1d"
                        }
                    );
                    return res.status(200).json({
                        message: "Authorization succesful!",
                        token: token,
                        email: user[0].email,
                        userId: user[0]._id
                    })
                }
                return res.status(401).json({
                    message: 'Authorization failed..',
                });
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});


//fetching the users corresponding notes
router.get('/:userId', (req, res, next) => {
    const id = req.params.userId
    User.findById(id).populate('notes').select('-password')
        .exec()
        .then(doc => {
            if (doc) {
                res.status(200).json(doc);
            } else {
                res.status(404).json({ message: 'User not found' })
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err })
        })
});

router.get('/tags/:userIde', (req, res, next) => {
    const id = req.params.userIde
    User.findById(id).populate('notes', 'langtag')
        .exec()
        .then(doc => {
            if (doc) {
                var newDoc = doc.notes.map(item => {
                    return {

                        langtag: item.langtag
                    }
                })
                var resArr = [];
                newDoc.filter(function(item) {
                    var i = resArr.findIndex(x => (x.langtag == item.langtag));
                    if (i <= -1) {
                        resArr.push(item);
                    }
                    return null;
                });

                res.status(200).json(resArr);
            } else {
                res.status(404).json({ message: 'User not found' })
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err })
        })
});

router.delete("/:userId", (req, res, next) => {
    User.remove({ _id: req.params.userId })
        .exec()
        .then(result => {
            res.status(200).json({
                message: "User deleted succesfully!"
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

module.exports = router;