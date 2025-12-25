import {
  Adapter,
  AdapterType,
  AdapterConfig,
  HealthCheckResult,
  ConnectionTestResult,
} from "../types";

export abstract class AbstractAdapter implements Adapter {
  abstract readonly type: AdapterType;
  abstract readonly name: string;
  abstract readonly version: string;

  protected config: AdapterConfig | null = null;
  protected initialized = false;

  async initialize(config: AdapterConfig): Promise<void> {
    this.config = config;
    await this.doInitialize();
    this.initialized = true;
  }

  abstract healthCheck(): Promise<HealthCheckResult>;
  abstract testConnection(): Promise<ConnectionTestResult>;

  protected abstract doInitialize(): Promise<void>;

  async cleanup(): Promise<void> {
    this.initialized = false;
    this.config = null;
  }

  protected ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error(`Adapter ${this.name} is not initialized`);
    }
  }

  protected getCredential(key: string): string | undefined {
    return this.config?.credentials?.[key] ?? process.env[key];
  }

  protected getOption<T>(key: string, defaultValue?: T): T | undefined {
    return (this.config?.options?.[key] as T) ?? defaultValue;
  }
}
