declare module "formidable" {
  import * as http from "http";

  export interface File {
    filepath: string;
    originalFilename?: string;
    mimetype?: string;
    size?: number;
  }

  export interface IncomingFormOptions {
    uploadDir?: string;
    keepExtensions?: boolean;
  }

  export class IncomingForm {
    uploadDir?: string;
    keepExtensions?: boolean;

    constructor(options?: IncomingFormOptions);
    parse(
      req: http.IncomingMessage,
      callback: (
        err: Error | null,
        fields: Record<string, any>,
        files: Record<string, File>
      ) => void
    ): void;
  }

  export default IncomingForm;
}