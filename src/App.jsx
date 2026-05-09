import { useState, useMemo } from 'react'

const RATES = {
  mastercard: {
    debito: 0.69,
    credito: 2.94,
    '2x': 3.84, '3x': 4.35, '4x': 4.86, '5x': 5.37, '6x': 5.88,
    '7x': 6.68, '8x': 7.19, '9x': 7.70, '10x': 8.21, '11x': 8.72, '12x': 9.23,
    '13x': 9.74, '14x': 10.25, '15x': 10.76, '16x': 11.27, '17x': 11.78, '18x': 12.29,
    '19x': 12.80, '20x': 13.31, '21x': 13.82
  },
  visa: {
    debito: 0.69,
    credito: 2.94,
    '2x': 3.84, '3x': 4.35, '4x': 4.86, '5x': 5.37, '6x': 5.88,
    '7x': 6.68, '8x': 7.19, '9x': 7.70, '10x': 8.21, '11x': 8.72, '12x': 9.23,
    '13x': 9.74, '14x': 10.25, '15x': 10.76, '16x': 11.27, '17x': 11.78, '18x': 12.29,
    '19x': 12.80, '20x': 13.31, '21x': 13.82
  },
  elo: {
    debito: 1.49,
    credito: 3.74,
    '2x': 4.64, '3x': 5.15, '4x': 5.66, '5x': 6.17, '6x': 6.68,
    '7x': 7.48, '8x': 7.99, '9x': 8.50, '10x': 9.01, '11x': 9.52, '12x': 10.03,
    '13x': 10.54, '14x': 11.05, '15x': 11.56, '16x': 12.07, '17x': 12.58, '18x': 13.09,
    '19x': 13.60, '20x': 14.11, '21x': 14.62
  },
  amex: {
    credito: 3.74,
    '2x': 4.64, '3x': 5.15, '4x': 5.66, '5x': 6.17, '6x': 6.68,
    '7x': 7.48, '8x': 7.99, '9x': 8.50, '10x': 9.01, '11x': 9.52, '12x': 10.03,
    '13x': 10.54, '14x': 11.05, '15x': 11.56, '16x': 12.07, '17x': 12.58, '18x': 13.09,
    '19x': 13.60, '20x': 14.11, '21x': 14.62
  }
}

const MODALITIES = [
  { id: 'debito', label: 'Débito (1 dia útil)' },
  { id: 'credito', label: 'Crédito à vista (2 dias úteis)' },
  ...Array.from({ length: 20 }, (_, i) => ({
    id: `${i + 2}x`,
    label: `Parcelado em ${i + 2}x (2 dias úteis)`
  }))
]

function App() {
  const [amount, setAmount] = useState('')
  const [brand, setBrand] = useState('mastercard')
  const [modality, setModality] = useState('credito')

  // Prevent Amex with Debito
  const availableModalities = useMemo(() => {
    if (brand === 'amex') {
      return MODALITIES.filter(m => m.id !== 'debito')
    }
    return MODALITIES
  }, [brand])

  // Reset modality if invalid for new brand
  useMemo(() => {
    if (brand === 'amex' && modality === 'debito') {
      setModality('credito')
    }
  }, [brand, modality])

  const parsedAmount = parseFloat(amount.replace(',', '.')) || 0

  const taxPercentage = RATES[brand][modality] || 0
  
  const isInstallment = modality.endsWith('x')
  const installmentsCount = isInstallment ? parseInt(modality, 10) : 1

  // Cenário A: Repasse da Taxa. Quanto cobrar para receber o valor base?
  // Valor Cobrado = Valor Base / (1 - (Taxa/100))
  const amountToCharge = parsedAmount / (1 - (taxPercentage / 100))
  const repasseTaxValue = amountToCharge - parsedAmount
  const repasseInstallmentValue = isInstallment ? amountToCharge / installmentsCount : 0

  // Cenário B: Absorção da Taxa. Se cobrar o valor base, quanto recebe?
  // Valor Líquido = Valor Base * (1 - (Taxa/100))
  const netAmount = parsedAmount * (1 - (taxPercentage / 100))
  const absorcaoTaxValue = parsedAmount - netAmount
  const baseInstallmentValue = isInstallment ? parsedAmount / installmentsCount : 0

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4 font-sans text-gray-800">
      <div className="max-w-2xl w-full bg-white shadow-xl rounded-2xl p-6 md:p-8">
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-8">
          Calculadora de Taxas da Clínica
        </h1>

        <div className="space-y-6">
          {/* Valor Base */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor do Procedimento / Serviço
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500 font-medium">
                R$
              </span>
              <input
                type="text"
                className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-lg shadow-sm"
                placeholder="0.00"
                value={amount}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9.,]/g, '')
                  setAmount(val)
                }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Use ponto ou vírgula para centavos.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bandeira */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bandeira do Cartão
              </label>
              <select
                className="block w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              >
                <option value="mastercard">Mastercard</option>
                <option value="visa">Visa</option>
                <option value="elo">Elo</option>
                <option value="amex">American Express</option>
              </select>
            </div>

            {/* Modalidade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Forma de Pagamento
              </label>
              <select
                className="block w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white"
                value={modality}
                onChange={(e) => setModality(e.target.value)}
              >
                {availableModalities.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label} ({brand === 'amex' && m.id === 'debito' ? '-' : RATES[brand][m.id]}%)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-10 space-y-6">
          {/* Cenario 1 */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
              Cenário 1: Repassar a taxa ao cliente
            </h2>
            <p className="text-sm text-blue-800 mb-4">
              Para você receber exatos <strong className="text-lg">{formatCurrency(parsedAmount)}</strong> na sua conta, você deve cobrar:
            </p>
            <div className="flex justify-between items-end border-t border-blue-200 pt-4">
              <div>
                <p className="text-xs text-blue-700 font-medium uppercase tracking-wider mb-1">Valor a cobrar na máquina</p>
                <p className="text-3xl font-bold text-blue-700">{formatCurrency(amountToCharge)}</p>
                {isInstallment && (
                  <p className="text-sm font-medium text-blue-600 mt-1">
                    em {installmentsCount}x de {formatCurrency(repasseInstallmentValue)}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs text-blue-600 mb-1">Taxa retida ({taxPercentage}%)</p>
                <p className="text-sm font-semibold text-red-500">-{formatCurrency(repasseTaxValue)}</p>
              </div>
            </div>
          </div>

          {/* Cenario 2 */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              Cenário 2: Absorver a taxa (Desconto)
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Se você cobrar exatos <strong className="text-lg">{formatCurrency(parsedAmount)}</strong> na máquina, você vai receber:
            </p>
            <div className="flex justify-between items-end border-t border-gray-200 pt-4">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Valor líquido na sua conta</p>
                <p className="text-3xl font-bold text-green-600">{formatCurrency(netAmount)}</p>
                {isInstallment && (
                  <p className="text-sm font-medium text-gray-500 mt-1">
                    Cliente paga {installmentsCount}x de {formatCurrency(baseInstallmentValue)}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-1">Taxa retida ({taxPercentage}%)</p>
                <p className="text-sm font-semibold text-red-500">-{formatCurrency(absorcaoTaxValue)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
