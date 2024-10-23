export class Crypto {
  constructor(cryptoName, cryptoAbbreviation) {
    this.cryptoName = cryptoName;
    this.apiUrl = `https://api.binance.com/api/v3/avgPrice?symbol=${cryptoAbbreviation}BRL`;
  }

  // Método para buscar o preço da criptomoeda
  async fetchPrice() {
    try {
      const response = await fetch(this.apiUrl);
      const brutePrice = await response.json();
      return parseFloat(brutePrice.price).toFixed(2);
    } catch (error) {
      console.error(`Erro ao buscar o preço de ${this.cryptoName}:`, error);
      throw new Error(`Não foi possível buscar o preço de ${this.cryptoName}.`);
    }
  }

  // Método para formatar o preço como moeda BRL
  formatPrice(price) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  }

  // Método para obter o preço formatado
  async getPrice() {
    const price = await this.fetchPrice();
    return this.formatPrice(price);
  }
}
