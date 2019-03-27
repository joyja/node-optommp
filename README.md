# node-optommp

Opto22MMP client written in javascript. Allows Access to Opto22 groov EPIC processors using the OptoMMP protocol directly from nodejs. This was adapted from the python toolkit, so if you need the same thing in python go [here](https://github.com/optodeveloper/optommp).

## Getting Started

Install with npm

```
npm install node-optommp
```

### Instantiating the client

```
const O22MMP = require('node-optommp')
const host = '192.168.1.1'
const client = new O22MMP(host) ##omit host to connect to loclahost 
```

All read and write methods return promises:
<details><summary>Misc. Methods</summary>

* **ReadRawOffset(offset, size, data_type)** - Rads the raw address at `offset` collecting `size` bytes and using `data_type` formatting to unpack it.

* **LastError()** - Returns the last error response code.

* **UnitDescription()** - Returns the device unit description. For example, `GRV-EPIC-PR1`

* **FirmwareVersion()** - Returns the device firmware version. For example, 'R1.1a'

</details>
<details><summary>Ethernet Status Access Methods</summary>

* **IPAddressE0()** - Returns the IP address associated with Ethernet 0 on the controller.

* **MACAddressE0()** - Returns the MAC address associated with Ethernet 0 on the controller.

* **IPAddressE1()** - Returns the IP address associated with Ethernet 1 on the controller.

* **MACAddressE1()** - Returns the MAC address associated with Ethernet 1 on the controller.

</details>
<details><summary>Analog & Digital I/O Access Methods</summary>

* **SetDigitalPointState(module, channel, state)** - The HD digital output at `channel` on `module` will be toggled to `state`, which should be either 1 or 0. Returns status code.

* **GetDigitalPointState(module, channel)** - The state of the HD digital output at `channel` on `module` will be fetched. Returns state either 1 or 0.


* **GetAnalogPointValue(module, channel)** - Return the current float value of the analog I/O installed at `channel` on `module`.

* **SetAnalogPointValue(module, channel, value)** - Set the analog I/O installed at `channel` on `module` to be `value`. `value` should be a float.

* **GetAnalogPointMin(module, channel)** - Return the minimum float value of the analog I/O installed at `channel` on `module`.

* **GetAnalogPointMax(module, channel)** - Return the maximum float value of the analog I/O installed at `channel` on `module`.

</details>
<details><summary>ScratchPad Area Access Methods</summary>

* **GetScratchPadIntegerArea(index)** - Returns the `index`<sup>th</sup> scratch pad integer.

* **SetScratchPadIntegerArea(index, value)** - Sets the `index`<sup>th</sup> scratch pad integer to be `value`.

* **GetScratchPadFloatArea(index)** - Returns the `index`<sup>th</sup> scratch pad float.

* **SetScratchPadFloatArea(index, value)** - Sets the `index`<sup>th</sup> scratch pad float to be `value`.

* **GetScratchPadStringArea(index)** - Returns the `index`<sup>th</sup> scratch pad string.

* **SetScratchPadStringArea(index, data)** - Sets the `index`<sup>th</sup> scratch pad string to be `data`.

</details>
<details><summary>Internal Memory-Map Methods</summary>

* **UnpackReadResponse(data, data_type)** - Unpacks the string data from bytes 16-20 of a read response. Returns formatted data.<br>
	`data_type` --> struct format characters 'c', 'i', 'd', 'f', etc., or specifically 'FIRMWARE', 'IP', or 'MAC' for custom formatting, or 'NONE' for raw binary data.

* **UnpackWriteResponse(data)** - Unpacks the integer status code from bytes 4-8 of a write response. Returns int status.<br>

* **PackFloat(value)** - Packs floating point `vlaue` into a four-byte hexidecimal array.

* **PackInteger(value)** - Packs integer point `vlaue` into a four-byte hexidecimal array.


* **ReadBlock(address)** - Read value at memory location `address`. Relies on `BuidReadBlockRequest()`, wraps up `.send()` and `.recv()` methods. Returns unpacked string data.

* **WriteBlock(address, value)** - Write `value` into memory location `address`. Relies on `BuildWriteBlockRequest()`, wraps up `.send()` and `.recv()` methods. Returns int status.


* **BuildReadBlockRequest(dest, size)** - Build the read block request bytearray. Returns bytearray block.<br>
	This is an internally used utility method to build a read request. Client code isn't likely to need it.

* **BuildWriteBlockRequest(dest, value)** - Build the write block request bytearray. Returns bytearray block.<br>
	This is an internally used utility method to build a read request. Client code isn't likely to need it.

* **close()** - Closes the socket connection to the device. Call this before the end of the script.

</details>