export class CodeError extends Error {
    code: number;
  
    constructor(message: string, code: number, error_id?: string) {
      super(`${error_id ?? ''}|${message}`);
      this.code = code;
      this.name = 'CodeError';
  
      // Fix for extending built-ins like Error in TypeScript
      Object.setPrototypeOf(this, new.target.prototype);
    }
  }