/* eslint-disable no-unused-vars */
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const Note = require('./models/note')
const app = express()

app.use(express.json())
app.use(express.static('build'))
app.use(cors())

app.get('/api/notes', (req, res) => {
	Note.find({}).then(notes => {
		res.json(notes)
	})
})

app.get('/api/notes/:id', (req, res, next) => {
	Note.findById(req.params.id)
		.then(note => {
			if (note) {
				res.json(note)
			} else {
				res.status(404).end()
			}
		})
		.catch(err => next(err))
})

app.post('/api/notes', (req, res, next) => {
	const body = req.body

	if (body.content === undefined) {
		return res.status(400).json({
			error: 'content missing'
		})
	}

	const note = new Note({
		content: body.content,
		important: body.important || false,
		date: new Date(),
	})

	note.save()
		.then(savedNote => savedNote.toJSON())
		.then(savedAndFormattedNote => {
			res.json(savedAndFormattedNote)
		})
		.catch(err => next(err))

})

app.delete('/api/notes/:id', (req, res, next) => {
	Note.findByIdAndRemove(req.params.id)
		.then(result => {
			res.status(204).end()
		})
		.catch(err => next(err))
})

app.put('/api/notes/:id', (req, res, next) => {
	const body = req.body

	const note = {
		content: body.content,
		important: body.important,
	}

	Note.findByIdAndUpdate(req.params.id, note, { new: true })
		.then(updatedNote => {
			res.json(updatedNote)
		})
		.catch(err => next(err))
})

const unknownEndpoint = (req, res) => {
	res.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
	console.log(error.message)

	if (error.name === 'CastError') {
		return res.status(400).send({ error: 'malformatted id' })
	} else if (error.name === 'ValidationError') {
		return res.status(400).send({ error: error.message })
	}

	next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
	console.log(`Server running on ${PORT}`)
})