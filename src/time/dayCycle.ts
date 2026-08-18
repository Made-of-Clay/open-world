import { Color } from 'three';

const HOURS_PER_MINUTE = 2;
const HOURS_PER_SECOND = HOURS_PER_MINUTE / 60;
const START_HOUR = 8;

export type DayPhase = 'dawn' | 'day' | 'dusk' | 'night';

export interface SkyTint {
    top: Color;
    horizon: Color;
    bottom: Color;
    cloud: Color;
}

export interface LightingState {
    ambientIntensity: number;
    hemisphereIntensity: number;
    sunIntensity: number;
    sunColor: Color;
}

export interface DayState extends SkyTint, LightingState {
    hours: number;
    phase: DayPhase;
    dayFactor: number;
}

type Stop = [hour: number, color: Color];

const at = (hour: number, hex: string): Stop => [hour, new Color(hex)];

const TOP_STOPS: Stop[] = [
    at(0, '#070b1f'),
    at(4.5, '#070b1f'),
    at(5.5, '#3c2a5c'),
    at(6.8, '#3f6fd0'),
    at(9, '#2a7df0'),
    at(15, '#2a7df0'),
    at(17.2, '#6a3f8a'),
    at(19, '#070b1f'),
    at(24, '#070b1f'),
];

const HORIZON_STOPS: Stop[] = [
    at(0, '#121a33'),
    at(4.5, '#121a33'),
    at(5.5, '#c86a4a'),
    at(6.8, '#ffe6c2'),
    at(9, '#cfe9ff'),
    at(15, '#cfe9ff'),
    at(17.2, '#ff9a55'),
    at(19, '#121a33'),
    at(24, '#121a33'),
];

const BOTTOM_STOPS: Stop[] = [
    at(0, '#0a1024'),
    at(4.5, '#0a1024'),
    at(5.5, '#5a3a54'),
    at(6.8, '#9fb8d8'),
    at(9, '#a8c6e0'),
    at(15, '#a8c6e0'),
    at(17.2, '#7a4a55'),
    at(19, '#0a1024'),
    at(24, '#0a1024'),
];

const CLOUD_STOPS: Stop[] = [
    at(0, '#1a2238'),
    at(4.5, '#1a2238'),
    at(5.5, '#ffb080'),
    at(6.8, '#fff3e0'),
    at(9, '#ffffff'),
    at(15, '#ffffff'),
    at(17.2, '#ff9a66'),
    at(19, '#1a2238'),
    at(24, '#1a2238'),
];

const SUN_STOPS: Stop[] = [
    at(0, '#ffd0a0'),
    at(4.5, '#ffd0a0'),
    at(5.5, '#ffb060'),
    at(6.8, '#fff0d0'),
    at(9, '#fff4e0'),
    at(15, '#fff4e0'),
    at(17.2, '#ff9a4a'),
    at(19, '#ffd0a0'),
    at(24, '#ffd0a0'),
];

function sunAltitude(hour: number): number {
    return Math.cos(((hour - 12) / 12) * Math.PI);
}

function dayFactorAt(hour: number): number {
    return clamp01((sunAltitude(hour) + 0.15) / 0.4);
}

function clamp01(value: number): number {
    return Math.min(1, Math.max(0, value));
}

function phaseAt(hour: number): DayPhase {
    if (hour >= 8 && hour < 17.2) return 'day';
    if (hour >= 5.5 && hour < 8) return 'dawn';
    if (hour >= 17.2 && hour < 19.5) return 'dusk';
    return 'night';
}

function sampleStops(stops: Stop[], hour: number, out: Color): void {
    let i = 0;
    while (i < stops.length - 1 && stops[i + 1][0] <= hour) i++;
    const [t0, c0] = stops[i];
    const [t1, c1] = stops[i + 1];
    const t = clamp01((hour - t0) / (t1 - t0));
    const ease = (1 - Math.cos(t * Math.PI)) / 2;
    out.copy(c0).lerp(c1, ease);
}

function formatClock(hour: number): string {
    const h = Math.floor(hour);
    const m = Math.floor((hour - h) * 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export class DayCycle {
    hours = START_HOUR;
    speed = 1;
    readonly state: DayState;

    constructor() {
        this.state = {
            hours: START_HOUR,
            phase: phaseAt(START_HOUR),
            dayFactor: dayFactorAt(START_HOUR),
            top: new Color(),
            horizon: new Color(),
            bottom: new Color(),
            cloud: new Color(),
            sunColor: new Color(),
            ambientIntensity: 0,
            hemisphereIntensity: 0,
            sunIntensity: 0,
        };
        this.refresh();
    }

    tick(delta: number) {
        this.hours = (this.hours + delta * HOURS_PER_SECOND * this.speed) % 24;
        this.refresh();
    }

    get timeString(): string {
        return formatClock(this.hours);
    }

    get phase(): DayPhase {
        return this.state.phase;
    }

    private refresh() {
        const s = this.state;
        const h = this.hours;
        s.hours = h;
        s.phase = phaseAt(h);
        const dayFactor = dayFactorAt(h);
        s.dayFactor = dayFactor;
        sampleStops(TOP_STOPS, h, s.top);
        sampleStops(HORIZON_STOPS, h, s.horizon);
        sampleStops(BOTTOM_STOPS, h, s.bottom);
        sampleStops(CLOUD_STOPS, h, s.cloud);
        sampleStops(SUN_STOPS, h, s.sunColor);
        s.ambientIntensity = 0.15 + 0.2 * dayFactor;
        s.hemisphereIntensity = 0.2 + 0.3 * dayFactor;
        s.sunIntensity = 2.4 * dayFactor;
    }
}
