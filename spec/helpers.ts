import { container } from "tsyringe";

// Helper to register dependency using passed values
// Value format: [
//   property name,
//   property value,
//   promisify flag (optional, default: true)
// ]
export function depValueRegister(token: string, values: [[string, unknown, boolean?]]) {
  const depValue = new Map();

  values.forEach(([prop, value, promisify = true]) => {
    depValue.set(prop, promisify ? () => Promise.resolve(value) : value);
  });

  container.register(token, {
    useValue: Object.fromEntries(depValue),
  });
}
