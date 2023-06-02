# read-write-mutexify

Like [mutexify](https://github.com/mafintosh/mutexify) but with read/write locks

```
npm install read-write-mutexify
```

## Usage

``` js
const RW = require('read-write-mutexify')

const lock = new RW()

// read locks waits for writer locks to be released
const release1 = await lock.read()
const release2 = await lock.read() // make as many as you want

// only one writer can have the write lock and it waits
// for any read lock to be released

const release = await lock.writer()
```

## License

MIT
