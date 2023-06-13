import parseDuration from "parse-duration";
import type { Timestamp } from "fiberplane-charts";
import {
	AbsoluteTimeRange,
	FlexibleTimeRange,
	RelativeTimeRange,
} from "../types";

export type DateParts = {
	month: number;
	date: number;
	year: number;
	timestamp: Timestamp;
};

export function getDateParts(date: Date): DateParts {
	return {
		month: date.getMonth(),
		date: date.getDate(),
		year: date.getFullYear(),
		timestamp: date.toISOString(),
	};
}

export const timestampToDate = (timestamp: Timestamp): Date =>
	new Date(timestamp);

export const secondsToTimestamp = (seconds: number): Timestamp =>
	new Date(seconds * 1000).toISOString();

export const timestampToSeconds = (timestamp: Timestamp): number =>
	new Date(timestamp).getTime() / 1000;

export const msToTimestamp = (ms: number): Timestamp =>
	new Date(ms).toISOString();

export function createDefaultTimeRange(): FlexibleTimeRange {
	return {
		type: "relative",
		from: "now-1h",
		to: "now",
	};
}

export function relativeToAbsoluteTimeRange(
	timeRange: RelativeTimeRange,
): AbsoluteTimeRange {
	const fromDuration = getNowDuration(timeRange.from.trim().toLowerCase());
	if (fromDuration === null) {
		throw new Error(`Invalid from range: ${timeRange.from}`);
	}

	const toDuration = getNowDuration(timeRange.to.trim().toLowerCase());
	if (toDuration === null) {
		throw new Error(`Invalid to range: expected 'now', got: '${timeRange.to}'`);
	}

	if (fromDuration > toDuration) {
		throw new Error("End date is before start date");
	}

	const now = Date.now();
	return {
		type: "absolute",
		from: msToTimestamp(now + fromDuration),
		to: msToTimestamp(now + toDuration),
	};
}

/**
 * Get the duration from a human readable duration. Expecting a string like "now-1h".
 * and returning the value in milliseconds.
 */
export function getNowDuration(from: string): number | null {
	if (from === "now") {
		return 0;
	}

	const match = /^now\s?(?<sign>(-|\+))(?<duration>(.*?))$/.exec(from);

	if (!match?.groups?.duration) {
		return null;
	}

	const { duration, sign } = match.groups;
	const parsed = parseDuration(duration);
	if (parsed == null) {
		return null;
	}

	return sign === "+" ? parsed : -parsed;
}

export function validateRelativeTo(to: string): boolean {
	return to.trim().toLowerCase() === "now";
}

export function formatDuration(timeRange: FlexibleTimeRange) {
	if (timeRange.type === "relative" && timeRange.to === "now") {
		const duration = getNowDuration(timeRange.from);
		if (duration !== null) {
			return `Last ${humanizeDuration(-duration)}`;
		}
	}

	return `${timeRange.from} - ${timeRange.to}`;
}

const millisecondsPerSecond = 1000;
const millisecondsPerMinute = 60 * millisecondsPerSecond;
const millisecondsPerHour = 60 * millisecondsPerMinute;
const millisecondsPerDay = 24 * millisecondsPerHour;
const millisecondsPerWeek = 7 * millisecondsPerDay;

function humanizeDuration(value: number) {
	let duration = value;

	const weeks = Math.floor(duration / millisecondsPerWeek);
	duration %= millisecondsPerWeek;
	const days = Math.floor(duration / millisecondsPerDay);
	duration %= millisecondsPerDay;

	const hours = Math.floor(duration / millisecondsPerHour);
	duration %= millisecondsPerHour;

	const minutes = Math.floor(duration / millisecondsPerMinute);
	duration %= millisecondsPerMinute;

	const seconds = Math.floor(duration / millisecondsPerSecond);
	let result = "";

	if (weeks > 0) {
		result += `${weeks > 1 ? `${weeks} ` : ""}week${weeks > 1 ? "s" : ""}`;
	}
	if (days > 0) {
		result += `${result.length ? ", " : ""}${pluralize(days, "day", {
			skipOne: result.length > 0,
		})}`;
	}

	if (hours > 0) {
		result += `${result.length ? ", " : ""}${pluralize(hours, "hour", {
			skipOne: result.length > 0,
		})}`;
	}

	if (minutes > 0) {
		result += `${result.length ? ", " : ""}${pluralize(minutes, "minute", {
			skipOne: result.length > 0,
		})}`;
	}
	if (seconds > 0) {
		result += `${result.length ? ", " : ""}${pluralize(seconds, "second", {
			skipOne: result.length > 0,
		})}`;
	}

	return result;
}

function pluralize(
	value: number,
	unit: string,
	{ skipOne = false }: { skipOne: boolean },
) {
	if (value === 1 && skipOne) {
		return unit;
	}

	return `${value} ${unit}${value > 1 ? "s" : ""}`;
}
