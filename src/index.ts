import { filter, map, reduce, scan, tap, withLatestFrom } from "rxjs/operators";
import { determineSpeedLimitAccumulator, mphAccumulator, speedLimitsDiffer, timedGPSSignals } from "./helpers";
import * as colors from "colors/safe";

// Trigger test
// Next trigger test
// Third trigger test

const vehicleACoordinates = [
  [40.02574645774399,  -83.03642720881868],
  [40.025069432202606, -83.03637926433254],
  [40.02438906226201,  -83.03614859435726],
  [40.023614202495885, -83.0359719038384],
  [40.022760768235344, -83.03572413478065],
  [40.021918877228046, -83.0354039460795],
  [40.0211948272478,   -83.0351169497149],
  [40.02034341680324,  -83.03481386009622],
  [40.01908810621111,  -83.03439275328088],
  [40.01807002696958,  -83.03394951824117],
  [40.01683418931174,  -83.0336165890472],
  [40.01594318089708,  -83.03319414112735],
];

const gpsSignalsWithTimeStream = timedGPSSignals(vehicleACoordinates, 5000);

const vehicleSpeedEventStream = gpsSignalsWithTimeStream.pipe(
  scan(mphAccumulator, {})
);

const speedLimitEventStream = gpsSignalsWithTimeStream.pipe(
  scan(determineSpeedLimitAccumulator, { lastSpeedLimit: 0, currentSpeedLimit: 0 }),
  filter(speedLimitsDiffer)
)

const speedingCarEventStream = vehicleSpeedEventStream.pipe(
  withLatestFrom(speedLimitEventStream),
  map(([mph, speedLimits]) => {
    return {
      mph: mph.speed ? mph.speed : 0,
      speedLimit: speedLimits.currentSpeedLimit
    }
  }),
  filter(speedAndLimit => speedAndLimit.mph > speedAndLimit.speedLimit)
);

vehicleSpeedEventStream.subscribe(e => console.log(`${colors.green( "SPEED EVENT:")}      Vehicle is traveling ${e.speed} MPH`));
speedLimitEventStream.subscribe(e =>   console.log(`${colors.yellow("SPEED ZONE EVENT:")} Vehicle is in a ${e.currentSpeedLimit} MPH Speed Zone`));
speedingCarEventStream.subscribe(e =>  console.log(`${colors.red(   "SPEEDING EVENT:")}   Vehicle is traveling ${e.mph} MPH in a ${e.speedLimit} MPH Zone`));
