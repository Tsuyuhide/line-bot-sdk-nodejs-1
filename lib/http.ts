import axios, { AxiosError } from "axios";
import { detectContentType } from "./util";
import { Readable } from "stream";
import { HTTPError, ReadError, RequestError } from "./exceptions";

const pkg = require("../package.json");

function wrapError(err: AxiosError) {
  if (err.response) {
    throw new HTTPError(
      err.message,
      err.response.status,
      err.response.statusText,
      err,
    );
  } else if (err.code) {
    throw new RequestError(err.message, err.code, err);
  } else if (err.config) {
    // unknown, but from axios
    throw new ReadError(err);
  }

  // otherwise, just rethrow
  throw err;
}

const userAgent = `${pkg.name}/${pkg.version}`;

export function stream(url: string, headers: any): Promise<Readable> {
  headers["User-Agent"] = userAgent;
  return axios
    .get(url, { headers, responseType: "stream" })
    .then(res => res.data as Readable);
}

export function get(url: string, headers: any): Promise<any> {
  headers["User-Agent"] = userAgent;

  return axios
    .get(url, { headers })
    .then(res => res.data)
    .catch(wrapError);
}

export function post(url: string, headers: any, data?: any): Promise<any> {
  headers["Content-Type"] = "application/json";
  headers["User-Agent"] = userAgent;
  return axios
    .post(url, data, { headers })
    .then(res => res.data)
    .catch(wrapError);
}

export function postBinary(
  url: string,
  headers: any,
  data: Buffer | Readable,
  contentType?: string,
): Promise<any> {
  return new Promise(resolve => {
    return resolve(contentType ? contentType : detectContentType(data));
  }).then((contentType: string) => {
    headers["Content-Type"] = contentType;
    headers["User-Agent"] = userAgent;
    return axios
      .post(url, data, { headers })
      .then(res => res.data)
      .catch(wrapError);
  });
}

export function del(url: string, headers: any): Promise<any> {
  headers["User-Agent"] = userAgent;

  return axios
    .delete(url, { headers })
    .then(res => res.data)
    .catch(wrapError);
}
