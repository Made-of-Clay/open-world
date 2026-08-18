import { getGui } from '../getGui';
import type { DayCycle } from './dayCycle';

export interface TimeGui {
    refresh(): void;
}

export function createTimeGui(dayCycle: DayCycle): TimeGui {
    const gui = getGui();
    const timeFolder = gui.addFolder('Time');

    const display = {
        time: dayCycle.timeString,
        phase: dayCycle.phase,
    };
    const timeController = timeFolder.add(display, 'time').name('Clock').disable();
    const phaseController = timeFolder.add(display, 'phase').name('Phase').disable();
    timeFolder.add(dayCycle, 'speed').name('Speed').min(0.25).max(5).step(0.25);

    return {
        refresh() {
            display.time = dayCycle.timeString;
            display.phase = dayCycle.phase;
            timeController.updateDisplay();
            phaseController.updateDisplay();
        },
    };
}
