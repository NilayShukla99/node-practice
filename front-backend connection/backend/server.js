import express from 'express'

const app = express()
const port = process.env.PORT || 3000

app.get('/api/jokes', (req, res) => {
    const jokes = [
        {
          "id": 1,
          "category": "Technology",
          "setup": "Why did the developer go broke?",
          "punchline": "Because he used up all his cache.",
          "rating": "PG"
        },
        {
          "id": 2,
          "category": "Science",
          "setup": "What did the physicist say when he found a quantum pun?",
          "punchline": "It's both funny and not funny at the same time.",
          "rating": "PG"
        },
        {
          "id": 3,
          "category": "Work",
          "setup": "Why don't coworkers tell secrets in the office anymore?",
          "punchline": "Because the walls have Teams.",
          "rating": "G"
        },
        {
          "id": 4,
          "category": "Relationships",
          "setup": "Why did the introvert break up with the ghost?",
          "punchline": "Too much space, not enough presence.",
          "rating": "PG"
        },
        {
          "id": 5,
          "category": "Psychology",
          "setup": "Why did the INFP get lost in thought?",
          "punchline": "Because it was uncharted territory… and they brought snacks.",
          "rating": "G"
        },
        {
          "id": 6,
          "category": "Animals",
          "setup": "What do you call a cat that’s good at math?",
          "punchline": "An alge-purr-a expert.",
          "rating": "G"
        },
        {
          "id": 7,
          "category": "Space",
          "setup": "Why don’t aliens visit Earth anymore?",
          "punchline": "They read the reviews. One star.",
          "rating": "PG"
        },
        {
          "id": 8,
          "category": "Food",
          "setup": "Why did the tofu cross the road?",
          "punchline": "To prove it wasn’t chicken.",
          "rating": "G"
        },
        {
          "id": 9,
          "category": "AI",
          "setup": "What do you get when you cross an AI with a writer?",
          "punchline": "A plot device that never sleeps.",
          "rating": "PG"
        },
        {
          "id": 10,
          "category": "Self-Help",
          "setup": "Why did the self-help book file a restraining order?",
          "punchline": "It was tired of being read into.",
          "rating": "PG-13"
        }
      ]
      res.send(jokes);
})

app.listen(port, () => console.log(`backend listening on ${port}`))