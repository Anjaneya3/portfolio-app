// An error with an HTTP status code. Routes throw these and the error handler sends them to the browser.
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
