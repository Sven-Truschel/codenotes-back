const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const checkAuth = require('../middleware/check-auth');

const Note = require('../models/note');
const User = require('../models/user');

// Notes route index (Read All)
router.get('/', (req, res, next) => {
    Note.find()
        .select('title content _id email')
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                notes: docs.map(doc => {
                    return {
                        title: doc.title,
                        content: doc.content,
                        _id: doc._id,
                        creator: doc.creator,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/notes/' + doc._id
                        }
                    }
                })
            };
            if (docs.length > 0) {
                res.status(200).json(response);
            } else {
                res.status(404).json({
                    message: 'No entries found..'
                })
            }
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
});

// Notes route POST (Create)
router.post('/', checkAuth, (req, res, next) => {
    User.countDocuments({ email: req.body.email }, (err, count) => {
        if (count >= 1) {
            const note = new Note({
                _id: new mongoose.Types.ObjectId(),
                title: req.body.title,
                content: req.body.content,
                email: req.body.email,
                langtag: req.body.langtag,
                dateCreated: Date.now()
            });
            note.save().then(result => {
                    console.log(result);
                    res.status(201).json({
                        message: 'Created note succesfully!',
                        createdNote: {
                            _id: result._id,
                            title: result.title,
                            content: result.content,
                            langtag: result.langtag
                        }
                    });


                }).then((result) => {
                    User.findOne({ email: note.email }, (err, user) => {
                        if (user) {
                            user.notes.push(note);
                            user.save();
                        }
                    });
                }).catch(err => {
                    console.log(err)
                    res.status(500).json({
                        message: 'User doesnt exist'
                    })
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({
                        error: err
                    });
                });
        } else {
            res.status(422).json({
                message: 'Email doesn\'t exist'
            })
        }
    })



});



// Notes route GET (Read Single)
router.get('/:noteId', (req, res, next) => {
    const id = req.params.noteId;
    Note.findById(id)
        .select('title content _id langtag')
        .exec()
        .then(doc => {
            console.log("From database:", doc);
            if (doc) {
                res.status(200).json(doc);
            } else {
                res.status(404).json({ message: 'No valid entry found' })
            }

        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
});


// Notes route POST (Create)
router.patch('/:notesId', checkAuth, (req, res, next) => {
    const id = req.params.notesId
    const updateOps = {};
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value
    }
    Note.update({ _id: id }, { $set: updateOps })
        .exec()
        .then(result => {
            console.log(result);
            res.status(200).json({
                message: "Note updated succesfully!",
                request: {
                    type: "GET",
                    url: 'http://localhost:3000/notes/' + id
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        });
});


// Notes route DELETE (Delete)
router.delete('/:notesId', checkAuth, (req, res, next) => {
    const id = req.params.notesId
    Note.deleteOne({ _id: id })
        .exec()
        .then(result => {
            res.status(200).json({
                message: "Note deleted!"
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