// Base Error class for API errors
export class ApiError extends Error {
    constructor(
      statusCode,
      message = "Something went wrong",
      errors = [],
      stack = ""
    ) {
      super(message);
      this.statusCode = statusCode;
      this.message = message;
      this.errors = errors;
      this.success = false;
      this.data = null;
  
      // If a stack trace is provided, use it, otherwise, generate one
      if (stack) {
        this.stack = stack;
      } else {
        Error.captureStackTrace(this, this.constructor);
      }
    }
  }
  
  // CommanderError class for general errors
  export class CommanderError extends Error {
    constructor(message) {
      super(message);
      this.name = 'CommanderError';
    }
  }
  
  // InvalidArgumentError class for argument-related errors
  export class InvalidArgumentError extends CommanderError {
    constructor(message) {
      super(message);
      this.name = 'InvalidArgumentError';
    }
  }
  
  // InvalidOptionArgumentError is deprecated and aliasing InvalidArgumentError
  export class InvalidOptionArgumentError extends InvalidArgumentError {
    constructor(message) {
      super(message);
      this.name = 'InvalidOptionArgumentError';
    }
  }
  // Class Argument definition (or function, if needed)
export class Argument {
    constructor(name, value) {
      this.name = name;
      this.value = value;
    }
  }
  
  export class Command {
    constructor(name, description) {
      this.name = name;
      this.description = description;
    }
  }
 export  class Help {
    constructor(topic, description) {
      this.topic = topic;
      this.description = description;
    }
  
    getHelpMessage() {
      return `Help Topic: ${this.topic}\nDescription: ${this.description}`;
    }
  }
  
  export class Option {
    constructor(flag, description, defaultValue = null) {
      this.flag = flag;
      this.description = description;
      this.defaultValue = defaultValue;
    }
  
    getOptionDetails() {
      return `Flag: ${this.flag}\nDescription: ${this.description}\nDefault Value: ${this.defaultValue}`;
    }
  }
   // Ensure 'Command' is exported
  
  // Exporting Argument class

  