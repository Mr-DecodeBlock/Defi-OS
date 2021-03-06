import React, { useEffect, useState } from 'react'
import { useMoralis } from 'react-moralis'
import { Button, Card } from 'antd'
import { ArrowDownOutlined } from '@ant-design/icons'

import { CurrentTrade, DexToken, Quote } from '../../../types/models/dex'
import { INITIAL_TOKEN, nativeAddress } from '../services/constants'
import { processTokenList } from '../services/utils'
import { Token } from './_token'
import { Indicator } from './_indicator'
import { PriceSwap } from './_price-swap'

interface ChainInterface {
  path: string
}

export const Chain: React.FC<ChainInterface> = (props: ChainInterface) => {
  const { path } = props

  const { account, Moralis } = useMoralis()

  const [tokenList, setTokenList] = useState<DexToken[]>([])

  const [fromToken, setFromToken] = useState<DexToken>(INITIAL_TOKEN)

  const [fromTokenAmount, setFromTokenAmount] = useState<number | string>('')

  const [fromTokenUSD, setFromTokenUSD] = useState<number | undefined>(undefined)

  const [toToken, setToToken] = useState<DexToken>(INITIAL_TOKEN)

  const [toTokenAmount, setToTokenAmount] = useState<number | string>('')

  const [toTokenUSD, setToTokenUSD] = useState<number | undefined>(undefined)

  const [currentTrade, setCurrentTrade] = useState<CurrentTrade | null>(null)

  const [quote, setQuote] = useState<Quote | null>(null)

  useEffect(() => {
    const fetchTokens = () => {
      if (!Moralis?.Plugins?.oneInch) return undefined

      Moralis.Plugins.oneInch
        .getSupportedTokens({ chain: path })
        .then(tokens => setTokenList(processTokenList(tokens.tokens)))

      return undefined
    }

    fetchTokens()
  }, [Moralis.Plugins, path])

  useEffect(() => {
    if (fromToken.name && fromTokenAmount && toToken.name) {
      setCurrentTrade({
        chain: path,
        fromTokenAddress: fromToken.address,
        toTokenAddress: toToken.address,
        amount: Moralis.Units.Token(fromTokenAmount, 18).toString(),
      })
    }
    return undefined
  }, [
    Moralis,
    fromToken.name,
    fromTokenAmount,
    toToken.name,
    fromToken.address,
    path,
    toToken.address,
  ])

  useEffect(() => {
    const getQuote = () => {
      if (!Moralis?.Plugins?.oneInch || !currentTrade) return undefined

      Moralis.Plugins.oneInch.quote(currentTrade).then(response => {
        setQuote({
          estimatedGas: response.estimatedGas,
          fromTokenAmount: response.fromTokenAmount,
          toTokenAmount: response.toTokenAmount,
          fromToken: response.fromToken,
          toToken: response.toToken,
        })
        setToTokenAmount(response.toTokenAmount)
      })

      return undefined
    }

    getQuote()
  }, [Moralis.Plugins, currentTrade])

  const doSwap = async () =>
    Moralis.Plugins.oneInch.swap({
      chain: path,
      fromTokenAddress: fromToken.address,
      toTokenAddress: toToken.address,
      amount: Moralis.Units.Token(fromTokenAmount, fromToken.decimals).toString(),
      fromAddress: account,
      slippage: 1,
    })

  const trySwap = async () => {
    const amount = Moralis.Units.Token(fromTokenAmount, fromToken.decimals).toString()
    if (fromToken.address !== nativeAddress) {
      await Moralis.Plugins.oneInch
        .hasAllowance({
          chain: path,
          fromTokenAddress: fromToken.address,
          fromAddress: account,
          amount,
        })
        .then(async allowance => {
          console.log(allowance)

          await Moralis.Plugins.oneInch.approve({
            chain: path,
            tokenAddress: fromToken.address,
            fromAddress: account,
          })
        })
        .catch(error => alert(error.message))
    }

    await doSwap()
      .then(receipt => {
        if (receipt.statusCode !== 400) {
          alert('Swap Complete!')
        }
        console.log(receipt)
      })
      .catch(error => alert(error.message))
  }

  return (
    <Card>
      <Token
        direction="From"
        token={fromToken}
        setToken={setFromToken}
        amount={fromTokenAmount}
        setAmount={setFromTokenAmount}
        tokenList={tokenList}
        usdPrice={fromTokenUSD}
        setUSDPrice={setFromTokenUSD}
        path={path}
      />

      <div style={{ fontSize: '16px', marginBottom: '10px', textAlign: 'center' }}>
        <ArrowDownOutlined />
      </div>

      <Token
        direction="To"
        token={toToken}
        setToken={setToToken}
        amount={toTokenAmount}
        setAmount={setToTokenAmount}
        tokenList={tokenList}
        usdPrice={toTokenUSD}
        setUSDPrice={setToTokenUSD}
        path={path}
      />

      {quote && (
        <div>
          <Indicator name="Estimated Gas:" value={quote?.estimatedGas} />
          <PriceSwap
            quote={quote}
            fromToken={fromToken}
            toToken={toToken}
            toTokenUSD={toTokenUSD}
          />
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        <Button
          disabled={!quote}
          style={{
            width: '100%',
            margin: '8px',
            marginTop: '20px',
            backgroundColor: '#61F38E',
            color: '#000',
          }}
          size="large"
          onClick={() => trySwap()}
        >
          Swap me!!
        </Button>
      </div>
    </Card>
  )
}
