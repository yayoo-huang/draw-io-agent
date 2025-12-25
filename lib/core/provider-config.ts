import type { ProviderName, ProviderConfig } from "../types/index.js";

const PROVIDER_ENV_VARS: Record<ProviderName, string | null> = {
  bedrock: null, // AWS SDK uses IAM role or env vars
  openai: "OPENAI_API_KEY",
  anthropic: "ANTHROPIC_API_KEY",
  google: "GOOGLE_GENERATIVE_AI_API_KEY",
  azure: "AZURE_API_KEY",
  ollama: null,
  openrouter: "OPENROUTER_API_KEY",
  deepseek: "DEEPSEEK_API_KEY",
  siliconflow: "SILICONFLOW_API_KEY",
  gateway: "AI_GATEWAY_API_KEY",
};

const ALLOWED_CLIENT_PROVIDERS: ProviderName[] = [
  "openai",
  "anthropic",
  "google",
  "azure",
  "openrouter",
  "deepseek",
  "siliconflow",
  "gateway",
];

export class ProviderManager {
  /**
   * Get default provider from environment variables
   */
  getDefaultProvider(): ProviderConfig {
    const provider = (process.env.AI_PROVIDER || "bedrock") as ProviderName;
    const modelId = process.env.AI_MODEL;

    if (!modelId) {
      throw new Error("AI_MODEL environment variable is required");
    }

    return { provider, modelId };
  }

  /**
   * Validate client-provided configuration
   * Security: Prevent SSRF attacks by requiring API key when using custom baseUrl
   */
  validateClientConfig(config: ProviderConfig): boolean {
    // Security check: custom baseUrl requires API key
    if (config.baseUrl && !config.apiKey) {
      throw new Error("API key required when using custom base URL");
    }

    // Only allow specific providers for client configuration
    if (!ALLOWED_CLIENT_PROVIDERS.includes(config.provider)) {
      throw new Error(
        `Client configuration not allowed for ${config.provider}`
      );
    }

    return true;
  }

  /**
   * Validate server credentials for the selected provider
   */
  validateProviderCredentials(provider: ProviderName): void {
    const requiredVar = PROVIDER_ENV_VARS[provider];
    if (requiredVar && !process.env[requiredVar]) {
      throw new Error(
        `${requiredVar} environment variable is required for ${provider} provider`
      );
    }

    // Azure requires additional config
    if (provider === "azure") {
      const hasBaseUrl = !!process.env.AZURE_BASE_URL;
      const hasResourceName = !!process.env.AZURE_RESOURCE_NAME;
      if (!hasBaseUrl && !hasResourceName) {
        throw new Error(
          "Azure requires either AZURE_BASE_URL or AZURE_RESOURCE_NAME"
        );
      }
    }
  }

  /**
   * Get provider configuration (server or client override)
   */
  getProviderConfig(clientOverride?: ProviderConfig): ProviderConfig {
    if (clientOverride) {
      this.validateClientConfig(clientOverride);
      return clientOverride;
    }

    const defaultConfig = this.getDefaultProvider();
    this.validateProviderCredentials(defaultConfig.provider);
    return defaultConfig;
  }
}
