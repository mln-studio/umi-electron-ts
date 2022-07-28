import { protocol } from 'electron';
import * as path from 'path';
import { URL } from 'url';

export default (scheme: string) => {
  protocol.registerFileProtocol(scheme, (request, respond) => {
    const url = new URL(request.url);
    const pathName = decodeURI(url.pathname);
    const filePath = path.join(__dirname, pathName);
    respond({ path: filePath });
  });
};
