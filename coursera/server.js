const http = require('http');
const { getToday } = require('./date');

const server = http.createServer((req, res) => {
    const dataLogger = () => {
        console.log('data written')
    };
    res.write('hello',dataLogger)
    // res.writeHead(200, {
    //     'content-length': 'hello world'.length,
    //     'content-type': 'text/plain'
    // });
    res.end(/*'ending...'+getToday(), () => console.log('response close')*/);
});

server.listen('3000', () => console.log('server running on 3000'));