const net = require('net')
const O22SIOUT = require('./o22siout')

class O22MMP {
  constructor(host = null) {
    host = host ? host : '127.0.0.1'
    this.sock = net.connect({ host, port: 2001 })
    this.tlabel = 0
  }
  // Misc MMP Access Functions
  readRawOffset(offset, size, dataType) {
    return new Promise((resolve, reject) => {
      this.readBlock(parseInt(offset, 16), size)
        .then((data) => {
          resolve(this.unpackReadResponse(data, dataType))
        })
        .catch(reject)
    })
  }
  lastError(){
    return new Promise((resolve, reject) => {
      this.readBlock(O22SIOUT.BASE_LAST_ERROR, 4)
        .then((data) => {
          resolve(parseInt(this.unpackReadResponse(data, 'i')).toString(16).toUpperCase())
        })
        .catch(reject)
    })
  }
  unitDescription(){
    return new Promise((resolve, reject) => {
      this.readBlock(O22SIOUT.BASE_UNIT_DESCRIPTION, 12)
        .then((data) => {
          resolve(this.unpackReadResponse(data, 'NONE'))
        })
        .catch(reject)
    })
  }
  firmwareVersion(){
    return new Promise((resolve, reject) => {
      this.readBlock(O22SIOUT.BASE_FIRMWARE_VERSION, 4)
        .then((data) => {
          resolve(this.unpackReadResponse(data, 'FIRMWARE'))
        })
        .catch(reject)
    })
  }
  //Ethernet Status Access Functions
  //Eth0 STATUS
  IPAddressE0() {
    return new Promise((resolve, reject) => {
      this.readBlock(O22SIOUT.BASE_IP_ADDRESS_ETH0, 4)
        .then((data) => {
          resolve(this.unpackReadResponse(data, 'IP'))
        })
        .catch(reject)
    })
  }
  MACAddressE0() {
    return new Promise((resolve, reject) => {
      this.readBlock(O22SIOUT.BASE_MAC_ADDRESS_ETH0, 6)
        .then((data) => {
          resolve(this.unpackReadResponse(data, 'MAC'))
        })
        .catch(reject)
    })
  }
  //Eth1 STATUS
  IPAddressE1() {
    return new Promise((resolve, reject) => {
      this.readBlock(O22SIOUT.BASE_IP_ADDRESS_ETH1, 4)
        .then((data) => {
          resolve(this.unpackReadResponse(data, 'IP'))
        })
        .catch(reject)
    })
  }
  MACAddressE1() {
    return new Promise((resolve, reject) => {
      this.readBlock(O22SIOUT.BASE_MAC_ADDRESS_ETH1, 6)
        .then((data) => {
          resolve(this.unpackReadResponse(data, 'MAC'))
        })
        .catch(reject)
    })
  }
  //DIGITAL POINTS
  getDigitalPointState(module, channel) {
    const offset = (O22SIOUT.BASE_DPOINT_READ
      + (module * O22SIOUT.OFFSET_DPOINT_MOD)
      + (channel * O22SIOUT.OFFSET_DPOINT))
    return new Promise((resolve, reject) => {
      this.readBlock(offset, 4)
        .then((data) => {
          resolve(parseInt(this.unpackReadResponse(data, 'i')))
        })
    })
  }
  setDigitalPointState(module, channel, state) {
    const offset = (O22SIOUT.BASE_DPOINT_WRITE
      + (module * O22SIOUT.OFFSET_DPOINT_MOD)
      + (channel * O22SIOUT.OFFSET_DPOINT))
      return new Promise((resolve, reject) => {
        this.writeBlock(offset, [0,0,0,state])
          .then((data) => {
            resolve(this.unpackWriteResponse(data))
          })
      })
  }
  //ANALOG POINTS
  getAnalogPointValue(module, channel) {
    const offset = (O22SIOUT.BASE_APOINT_READ
      + (O22SIOUT.OFFSET_APOINT_MOD * module)
      + (O22SIOUT.OFFSET_APOINT * channel))
    return new Promise((resolve, reject) => {
      this.readBlock(offset, 4)
        .then((data) => {
          resolve(parseFloat(this.unpackReadResponse(data, 'f')))
        })
        .catch(reject)
    })
  }
  setAnalogPointState(module, channel, value) {
    const offset = (O22SIOUT.BASE_APOINT_WRITE
      + (module * O22SIOUT.OFFSET_APOINT_MOD)
      + (channel * O22SIOUT.OFFSET_APOINT))
      return new Promise((resolve, reject) => {
        this.writeBlock(offset, this.packFloat(value))
          .then((data) => {
            resolve(this.unpackWriteResponse(data))
          })
      })
  }
  // MIN / MAX VALUES
  getAnalogPointMin(module, channel) {
    const offset = (O22SIOUT.BASE_APOINT_READ
      + (O22SIOUT.OFFSET_APOINT_MOD * module)
      + (O22SIOUT.OFFSET_APOINT * channel)
      + O22SIOUT.OFFSET_APOINT_MIN)
    return new Promise((resolve, reject) => {
      this.readBlock(offset, 4)
        .then((data) => {
          resolve(parseFloat(this.unpackReadResponse(data, 'f')))
        })
        .catch(reject)
    })
  }
  getAnalogPointMax(module, channel) {
    const offset = (O22SIOUT.BASE_APOINT_READ
      + (O22SIOUT.OFFSET_APOINT_MOD * module)
      + (O22SIOUT.OFFSET_APOINT * channel)
      + O22SIOUT.OFFSET_APOINT_MAX)
    return new Promise((resolve, reject) => {
      this.readBlock(offset, 4)
        .then((data) => {
          resolve(parseFloat(this.unpackReadResponse(data, 'f')))
        })
        .catch(reject)
    })
  }
  //SCRATCHPAD ACCESS FUNCTIONS
  //INTEGERS
  getScratchPadIntegerArea(index) {
    return new Promise((resolve, reject) => {
      if (index < 0 || index > O22SIOUT.MAX_ELEMENTS_INTEGER) {
        reject(new Error('Index out off bounds'))
      }
      const offset = O22SIOUT.BASE_SCRATCHPAD_INTEGER + (index * 0x04)
      this.readBlock(offset, 4)
        .then((data) => {
          resolve(this.unpackReadResponse(data, 'i'))
        })
        .catch(reject)
    })
  }
  setScratchPadIntegerArea(index, value) {
    return new Promise((resolve, reject) => {
      if (index < 0 || index > O22SIOUT.MAX_ELEMENTS_INTEGER) {
        reject(new Error('Index out off bounds'))
      }
      const offset = O22SIOUT.BASE_SCRATCHPAD_INTEGER + (index * 0x04)
      this.writeBlock(offset, this.packInteger(value))
        .then((data) => {
          resolve(this.unpackWriteResponse(data))
        })
        .catch(reject)
    })
  }
  //FLOATS
  getScratchPadFloatArea(index) {
    return new Promise((resolve, reject) => {
      if (index > O22SIOUT.MAX_ELEMENTS_FLOAT) {
        reject(new Error('Index out off bounds'))
      }
      const offset = O22SIOUT.BASE_SCRATCHPAD_FLOAT + (index * 0x04)
      this.readBlock(offset, 4)
        .then((data) => {
          resolve(this.unpackReadResponse(data, 'f'))
        })
        .catch(reject)
    })
  }
  setScratchPadFloatArea(index, value) {
    return new Promise((resolve, reject) => {
      if (index > O22SIOUT.MAX_ELEMENTS_FLOAT) {
        reject(new Error('Index out off bounds'))
      }
      const offset = O22SIOUT.BASE_SCRATCHPAD_FLOAT + (index * 0x04)
      this.writeBlock(offset, this.packFloat(value))
        .then((data) => {
          resolve(this.unpackWriteResponse(data))
        })
        .catch(reject)
    })
  }
  //STRINGS
  getScratchPadStringArea(index) {
    return new Promise((resolve, reject) => {
      const loc = O22SIOUT.OFFSET_SCRATCHPAD_STRING * index
      if (index < 0 || loc >= O22SIOUT.MAX_BYTES_STRING) {
        reject(new Error('Index out off bounds'))
      }
      const offset = O22SIOUT.BASE_SCRATCHPAD_STRING + loc
      this.readBlock(offset + 0x01, 1)
        .then((data) => {
          const size = [...this.unpackReadResponse(data, 'NONE').slice(16)].toString()
          this.readBlock(offset + 0x02, size)
            .then((data) => {
              resolve(this.unpackReadResponse(data, 'NONE').slice(16).toString())
            })
            .catch(reject)
        })
        .catch(reject)
    })
  }
  unpackReadResponse(data, dataType) {
    let output = ''
    let parts = []
    if (dataType === 'FIRMWARE') {
      const version = data.slice(16)
      let prefix = ''
      console.log(version[2])
      if (parseInt(version[2]) === 0) { prefix = 'A'}
      else if (parseInt(version[2]) === 1) { prefix = 'B'}
      else if (parseInt(version[2]) === 2) { prefix = 'R'}
      else if (parseInt(version[2]) === 3) { prefix = 'S'}
      else { prefix = '?'}
      output = `${prefix}${parseInt(version[0]).toString()}.${parseInt(version[1]).toString()}${String.fromCharCode(parseInt(version[3])+97)}`
    } else if (dataType === 'IP') {
      parts = [...data].slice(16).map((part) => {
        return part.toString()
      })
      output = parts.join('.')
    } else if (dataType === 'MAC') {
      parts = [...data].slice(16).map((part) => {
        const hex = part.toString(16).toUpperCase()
        return hex.length < 2 ? `0${hex}` : hex
      })
      output = parts.join('-')
    } else if (dataType === 'NONE') {
      output = data
    } else {
      if (dataType === 'f') {
        output = data.readFloatBE(16)
      } else if (dataType === 'i') {
        output = data.readIntBE(16,4)
      }
    }
    return output
  }
  unpackWriteResponse(data) {
    return data.readIntBE(4,8)
  }
  // METHODS TO PACKAGE DATA INTO HEX ARRAYS
  packFloat(value) {
    const valueToWrite = new Buffer([0,0,0,0])
    valueToWrite.writeFloatBE(value)
    return valueToWrite
  }
  packInteger(value) {
    const valueToWrite = new Buffer([0,0,0,0])
    valueToWrite.writeIntBE(value,0,4)
    return valueToWrite
  }
  // CORE MEMORY ACCESS FUNCTIONS
  // ReadBlock
  readBlock(address, size) {
    const block = this.buildReadBlockRequest(address, size)
    const nSent = this.sock.write(block)
    return new Promise((resolve, reject) => {
      this.sock.on('data', (data) => {
        resolve(data)
      })
      this.sock.on('error', reject)
    })
  }
  writeBlock(address, value) {
    const block = this.buildWriteBlockRequest(address, value)
    const nSent = this.sock.write(block)
    return new Promise((resolve, reject) => {
      this.sock.on('data', (data) => {
        resolve(data)
      })
      this.sock.on('error', reject)
    })
  }
  // BLOCK REQUEST BYT ARRAY CONSTRUCTORS
  buildReadBlockRequest(dest, size) {
    const tcode = O22SIOUT.TCODE_READ_BLOCK_REQUEST
    const block = [
      0, 0, (this.tlabel << 2), (tcode << 4), 0, 0, 255, 255,
      parseInt(dest.toString(16).slice(0,2),16), parseInt(dest.toString(16).slice(2,4),16),
      parseInt(dest.toString(16).slice(4,6),16), parseInt(dest.toString(16).slice(6,8),16),
      0,size,0,0
    ]
    return new Buffer(block)
  }
  buildWriteBlockRequest(dest, data) {
    const tcode = O22SIOUT.TCODE_WRITE_BLOCK_REQUEST
    const block = [
      0, 0, (this.tlabel << 2), (tcode << 4), 0, 0, 255, 255,
      parseInt(dest.toString(16).slice(0,2),16), parseInt(dest.toString(16).slice(2,4),16),
      parseInt(dest.toString(16).slice(4,6),16), parseInt(dest.toString(16).slice(6,8),16),
      0,data.length,0,0
    ]
    return new Buffer([...block,...data])
  }
  // CLOSE SOCKET / END SESSION
  close() {
    this.sock.destroy()
  }
}

module.exports = O22MMP