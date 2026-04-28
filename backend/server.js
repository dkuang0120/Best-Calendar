const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (replace with database)
let events = [];

// Get all events
app.get('/api/events', (req, res) => {
    res.json(events);
});

// Get event by ID
app.get('/api/events/:id', (req, res) => {
    const event = events.find(e => e.id === req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
});

// Create event
app.post('/api/events', (req, res) => {
    const event = {
        id: Date.now().toString(),
        title: req.body.title,
        description: req.body.description,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        date: req.body.date
    };
    events.push(event);
    res.status(201).json(event);
});

// Update event
app.put('/api/events/:id', (req, res) => {
    const event = events.find(e => e.id === req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    
    Object.assign(event, req.body);
    res.json(event);
});

// Delete event
app.delete('/api/events/:id', (req, res) => {
    events = events.filter(e => e.id !== req.params.id);
    res.json({ message: 'Event deleted' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));