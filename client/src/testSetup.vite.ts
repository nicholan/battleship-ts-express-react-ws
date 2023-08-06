import '@testing-library/jest-dom/extend-expect';
import { vi } from 'vitest';

HTMLCanvasElement.prototype.getContext = vi.fn() as typeof HTMLCanvasElement.prototype.getContext;
