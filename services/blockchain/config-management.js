/**
 * Config Management Service
 * 
 * Provides configuration management for blockchain services in the admin panel.
 */

class ConfigManagementService {
  constructor(blockchainConfigRepository) {
    this.blockchainConfigRepository = blockchainConfigRepository;
  }

  /**
   * Get all blockchain configurations
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array<Object>>} All blockchain configurations
   */
  async getAllConfigurations(filters = {}) {
    return await this.blockchainConfigRepository.findAll({
      where: filters
    });
  }

  /**
   * Get configuration by chain ID
   * @param {string} chainId - Chain identifier
   * @returns {Promise<Object>} Blockchain configuration
   */
  async getConfigurationByChainId(chainId) {
    const config = await this.blockchainConfigRepository.findOne({
      where: { chainId }
    });
    
    if (!config) {
      throw new Error(`Configuration not found for chain ID: ${chainId}`);
    }
    
    return config;
  }

  /**
   * Create a new blockchain configuration
   * @param {Object} configData - Configuration data
   * @returns {Promise<Object>} Created configuration
   */
  async createConfiguration(configData) {
    // Check if configuration already exists
    const existing = await this.blockchainConfigRepository.findOne({
      where: { chainId: configData.chainId }
    });
    
    if (existing) {
      throw new Error(`Configuration already exists for chain ID: ${configData.chainId}`);
    }
    
    // Create new configuration
    return await this.blockchainConfigRepository.create(configData);
  }

  /**
   * Update a blockchain configuration
   * @param {string} chainId - Chain identifier
   * @param {Object} updates - Configuration updates
   * @returns {Promise<Object>} Updated configuration
   */
  async updateConfiguration(chainId, updates) {
    const config = await this.blockchainConfigRepository.findOne({
      where: { chainId }
    });
    
    if (!config) {
      throw new Error(`Configuration not found for chain ID: ${chainId}`);
    }
    
    // Update configuration
    Object.assign(config, updates);
    await config.save();
    
    return config;
  }

  /**
   * Delete a blockchain configuration
   * @param {string} chainId - Chain identifier
   * @returns {Promise<boolean>} Success indicator
   */
  async deleteConfiguration(chainId) {
    const result = await this.blockchainConfigRepository.destroy({
      where: { chainId }
    });
    
    return result > 0;
  }

  /**
   * Enable a blockchain
   * @param {string} chainId - Chain identifier
   * @returns {Promise<Object>} Updated configuration
   */
  async enableBlockchain(chainId) {
    return await this.updateConfiguration(chainId, { isActive: true });
  }

  /**
   * Disable a blockchain
   * @param {string} chainId - Chain identifier
   * @returns {Promise<Object>} Updated configuration
   */
  async disableBlockchain(chainId) {
    return await this.updateConfiguration(chainId, { isActive: false });
  }

  /**
   * Update blockchain node URL
   * @param {string} chainId - Chain identifier
   * @param {string} nodeUrl - New node URL
   * @returns {Promise<Object>} Updated configuration
   */
  async updateNodeUrl(chainId, nodeUrl) {
    return await this.updateConfiguration(chainId, { nodeUrl });
  }

  /**
   * Update blockchain API key
   * @param {string} chainId - Chain identifier
   * @param {string} apiKey - New API key
   * @returns {Promise<Object>} Updated configuration
   */
  async updateApiKey(chainId, apiKey) {
    return await this.updateConfiguration(chainId, { apiKey });
  }
}

module.exports = ConfigManagementService;
