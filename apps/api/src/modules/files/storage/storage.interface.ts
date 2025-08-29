export interface StorageProvider {
  store(file: Express.Multer.File, key: string): Promise<string>;
  retrieve(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
}

export interface StorageConfig {
  basePath?: string;
  azureConnectionString?: string;
  azureContainerName?: string;
}
