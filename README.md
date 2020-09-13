# signal-to-event-rxjs

Simple demonstration of converting raw GPS coordinate signals coming off a fictional vehicle into a stream of events to show when a vehicle is speeding.  This implementation uses [RxJS](https://rxjs.dev/), however the principles could apply to many observable and streaming platforms or frameworks.

## Description

The element of time is added to a list of GPS coordinates to create an Observable stream named `gpsSignalsWithTimeStream`.  This stream emits a new signal of a GPS coordinate and observed time every 5 seconds.  This is an attempt to mock data that might be streamed off of a vehicle GPS device.

Two Event Streams can then be derived from that stream:

* `vehicleSpeedEventStream` - On every signal from `gpsSignalsWithTimeStream`, estimates a current speed for the vehicle based on the previously observed coordiate and time with the current.
* `speedLimitEventStream` - On every signal from `gpsSignalsWithTimeStream`, checks to see if the vehicle has entered a new speed limit zone with some very primitive logic that only looks at their latitude.  This stream only emits events when a new speed zone is detected by applying a filter to make sure the speed zone is different than the last check.

Finally, with 2 streams that emit events the current speed of a vehicle and what speed zone the vehicle is in, a final stream can emit events when the car is speeding.  This is done by effectively merging the `vehicleSpeedEventStream` and `speedLimitEventStream` event streams and applying some simple filtering logic to determine if the current speed is higher than the speed limit.

## Running the example

> [Node.js](https://nodejs.org/) is required for these examples which can be downloaded [here](https://nodejs.org/)

### Install dependent NPM modules

After cloning this repository, run the following from the root of the project:

```bash
npm install
```

### Build and run the example

This demo was written in [TypeScript](https://www.typescriptlang.org/) which needs to be compiled to JavaScript before Node.js can execute it.  The compilation and execution is all bundled into an NPM script named `exec`, which can be executed with the following command:

```bash
npm run exec
```

### Results

The results will come slow as the 5 seconds per GPS signal is replicated in real time.  When finished though, you should see the following output.  Some of the MPH calculations might be slightly off as the time element isn't exact between runs.

The first `SPEED EVENT` is `0 MPH` since there wasn't a previous reference point and time.

Notice how the event streams showing Speed Zones and Speeding detections only have new events when there are truly new events.  They don't necessarily emit every 5 seconds like the original GPS coordinate signals are.

```bash
SPEED EVENT:      Vehicle is traveling 0 MPH
SPEED ZONE EVENT: Vehicle is in a 60 MPH Speed Zone
SPEED EVENT:      Vehicle is traveling 54.26083449088473 MPH
SPEED EVENT:      Vehicle is traveling 56.242741816758425 MPH
SPEED EVENT:      Vehicle is traveling 62.949047469261885 MPH
SPEEDING EVENT:   Vehicle is traveling 62.96163476129731 MPH in a 60 MPH Zone
SPEED EVENT:      Vehicle is traveling 69.91057585707553 MPH
SPEED ZONE EVENT: Vehicle is in a 90 MPH Speed Zone
SPEED EVENT:      Vehicle is traveling 70.14648072014751 MPH
SPEED EVENT:      Vehicle is traveling 60.53101019179565 MPH
SPEED EVENT:      Vehicle is traveling 70.59534249274039 MPH
SPEED EVENT:      Vehicle is traveling 103.72260970827053 MPH
SPEEDING EVENT:   Vehicle is traveling 103.72260970827053 MPH in a 90 MPH Zone
SPEED EVENT:      Vehicle is traveling 85.8845546482001 MPH
SPEED EVENT:      Vehicle is traveling 100.98504651704056 MPH
SPEEDING EVENT:   Vehicle is traveling 100.98504651704056 MPH in a 90 MPH Zone
SPEED EVENT:      Vehicle is traveling 75.84611331248207 MPH
```
