import * as distance from "gps-distance";
import { interval, Observable } from "rxjs";
import { filter, map } from "rxjs/operators";

interface DatedGPSCoordinate {
  latitude: number;
  longitude: number;
  time: number;
}

interface MPHAccumulator {
  lastCoordinate?: DatedGPSCoordinate;
  speed?: number;
}

interface SpeedLimits {
  lastSpeedLimit: number;
  currentSpeedLimit: number;
}

export function timedGPSSignals(coordinates: Array<Array<number>>, period: number): Observable<DatedGPSCoordinate> {
  return interval(period).pipe(
    filter(iter => iter < coordinates.length),
    map(iter => {
      const gpsSignal = coordinates[iter];
      return {
        latitude: gpsSignal[0],
        longitude: gpsSignal[1],
        time: new Date().getTime()
      }
    })
  );
}

export function mphAccumulator(acc: any, value: DatedGPSCoordinate): MPHAccumulator {
  if (!acc.lastCoordinate) {
    return {
      lastCoordinate: value,
      speed: 0
    }
  } else {
    const hoursSinceLastSignal = (value.time - acc.lastCoordinate.time) / 1000 / 60 / 60;
    const milesTraveled = distance(acc.lastCoordinate.latitude, acc.lastCoordinate.longitude, value.latitude, value.longitude);
    const speedMPH = milesTraveled / hoursSinceLastSignal;

    return {
      lastCoordinate: value,
      speed: speedMPH
    }
  }
}

export function determineSpeedLimitAccumulator(acc: SpeedLimits, value: DatedGPSCoordinate): SpeedLimits {
  let currentSpeedLimit = 0;
  // Primitive sample logic that only looks at latitude ranges to determine the current speed limit
  if (value.latitude >= 40.023614202495885) {
    currentSpeedLimit = 60;
  } else if (value.latitude < 40.023614202495885 && value.latitude >= 40.01594318089708) {
    currentSpeedLimit = 90;
  }

  return {
    lastSpeedLimit: acc.currentSpeedLimit,
    currentSpeedLimit: currentSpeedLimit
  };
}

export function speedLimitsDiffer(speedLimits: SpeedLimits) {
  return speedLimits.lastSpeedLimit != speedLimits.currentSpeedLimit;
}
