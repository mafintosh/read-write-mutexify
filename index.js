module.exports = class ReadWriteLock {
  constructor () {
    this.destroyed = false
    this.writing = false
    this.readers = 0

    this.waitingReads = []
    this.waitingWrites = []

    this._waitForWriteLockBound = pushToQueue.bind(this, this.waitingWrites)
    this._waitForReadLockBound = pushToQueue.bind(this, this.waitingReads)

    this._releaseWriteLockBound = this._releaseWriteLock.bind(this)
    this._releaseReadLockBound = this._releaseReadLock.bind(this)
  }

  write () {
    if (this.writing === false && this.readers === 0) {
      this.writing = true
      return Promise.resolve(this._releaseWriteLockBound)
    }

    return new Promise(this._waitForWriteLockBound)
  }

  read () {
    if (this.writing === false) {
      this.readers++
      return Promise.resolve(this._releaseReadLockBound)
    }

    return new Promise(this._waitForReadLockBound)
  }

  destroy () {
    if (this.destroyed) return
    this.destroyed = true
    while (this.waitingReads.length) this.waitingReads.shift()[1](new Error('Lock destroyed'))
    while (this.waitingWrites.length) this.waitingWrites.shift()[1](new Error('Lock destroyed'))
  }

  _releaseWriteLock () {
    this.writing = false
    this._bump()
  }

  _releaseReadLock () {
    this.readers--
    this._bump()
  }

  _bump () {
    if (this.writing === false && this.readers === 0 && this.waitingWrites.length > 0) {
      this.writing = true
      this.waitingWrites.shift()[0](this._releaseWriteLockBound)
    }
    while (this.writing === false && this.waitingReads.length > 0) {
      this.readers++
      this.waitingReads.shift()[0](this._releaseReadLockBound)
    }
  }
}

function pushToQueue (queue, resolve, reject) {
  queue.push([resolve, reject])
}
