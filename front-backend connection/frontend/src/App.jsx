import React, { useState } from 'react'
import axios from 'axios'

function App() {
  const [jokes, setJokes] = useState([])

  React.useEffect(() => {
    axios.get('/api/jokes').then (res => {
      console.log('jokes: ', res.data)
      setJokes(res.data)

    });
  }, []);

  return (
    <>
      {jokes.map(joke => (<>
          <p>Setup: {joke.setup}</p>
          <p>Punchline: {joke.punchline}</p>
        </>))}
    </>
  )
}

export default App
