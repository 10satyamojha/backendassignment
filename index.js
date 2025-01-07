import { Argument } from './utils/ApiErr.js';
import { Command } from './utils/ApiErr.js';
import { CommanderError, InvalidArgumentError } from './utils/ApiErr.js';
import { Help } from './utils/ApiErr.js';
import { Option } from './utils/ApiErr.js';

// @ts-check

/**
 * Expose the root command.
 */

export const program = new Command(); // Explicit access to global command

/**
 * Expose classes
 */

export {
  Argument,
  Command,
  CommanderError,
  Help,
  InvalidArgumentError,  // No longer need to export InvalidOptionArgumentError as it's deprecated
  Option,
};
