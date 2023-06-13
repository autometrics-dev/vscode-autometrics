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

function parseDurationText(
	from: string,
): { duration: string; sign: "+" | "-" } | null {
	const match = /^now\s?(?<sign>(-|\+))(?<duration>(.*?))$/.exec(from);

	if (!match?.groups?.duration) {
		return null;
	}

	const { duration, sign } = match.groups;
	return { duration, sign };
}

/**
 * Get the duration from a human readable duration. Expecting a string like "now-1h".
 * and returning the value in milliseconds.
 */
export function getNowDuration(from: string): number | null {
	if (from === "now") {
		return 0;
	}

	const { duration, sign } = parseDurationText(from);
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
		const { duration } = parseDurationText(timeRange.from.trim().toLowerCase());
		if (duration) {
			return `Last ${duration}`;
		}
	}

	return `${timeRange.from} - ${timeRange.to}`;
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
