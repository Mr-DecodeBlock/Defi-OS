import React, { useContext, useEffect, useState } from 'react'
import { useERC20Transfers, useNFTTransfers, useMoralis } from 'react-moralis'
import { AppContext } from 'AppContext'
import { Loader } from 'components'
import { getEllipsisText } from 'utils/formatters'
import { getExplorer } from 'utils/networks'
import { GenericTransfer, erc20ToGenericTransfer, nftToGenericTransfer } from './HistoryHelper'

const History = () => {
  const { account } = useContext(AppContext)
  const { Moralis, chainId, isAuthenticated } = useMoralis()
  const { data: erc20Data } = useERC20Transfers({ address: account?.address })
  const { data: nftData } = useNFTTransfers({ address: account?.address })

  const [allTransfers, setAllTransfers] = useState<GenericTransfer[] | null>(null)

  useEffect(() => {
    if (!erc20Data || !nftData) {
      return
    }

    const erc20Transfers = ((erc20Data as any).result as any[]).map(erc20ToGenericTransfer)
    const nftTransfers = nftData.result.map(nftToGenericTransfer)
    const combinedTransfers = [...erc20Transfers, ...nftTransfers].sort(
      (a, b) => new Date(b.blockTimestamp).getTime() - new Date(a.blockTimestamp).getTime(),
    )
    setAllTransfers(combinedTransfers)
  }, [erc20Data, nftData])

  if (!isAuthenticated) {
    return (
      <div className="text-center">
        <span className="text-18 opacity-60">Please connect to your wallet...</span>
      </div>
    )
  }

  const columns = [
    {
      title: 'Token',
      key: 'address',
      render: (token: string) => getEllipsisText(token, 8),
    },
    {
      title: 'From',
      key: 'fromAddress',
      render: (from: string) => getEllipsisText(from, 8),
    },
    {
      title: 'To',
      key: 'toAddress',
      render: (to: string) => getEllipsisText(to, 8),
    },
    {
      title: 'Value',
      key: 'value',
      render: (value, item) => parseFloat(Moralis.Units.FromWei(value, item.decimals).toFixed(6)),
    },
    {
      title: 'Transaction',
      key: 'transactionHash',
      render: (hash: string) => (
        <a
          href={`${chainId && getExplorer(chainId)}tx/${hash}`}
          target="_blank"
          rel="noreferrer"
          className="text-green font-bold"
        >
          View Transaction
        </a>
      ),
    },
  ]

  return (
    <div className="w-full bg-white px-6 py-4 xl:px-12 xl:py-10">
      <div className="font-medium text-20 leading-26 my-4 xl:my-0 xl:text-32 xl:leading-42">
        History
      </div>

      {allTransfers &&
        (allTransfers.length > 0 ? (
          <table className="table-auto w-full xl:mt-10">
            <thead className="border-b border-black border-opacity-20 pb-10">
              <tr>
                {columns.map(column => (
                  <td key={column.key} className="pr-4">
                    <span className="opacity-60 text-14 xl:text-16">{column.title}</span>
                  </td>
                ))}
              </tr>
            </thead>
            <tbody>
              {allTransfers.map(transfer => (
                <tr key={`${transfer.type}-${transfer.transactionHash}`}>
                  {columns.map(column => (
                    <td key={column.key}>{column.render(transfer[column.key], transfer)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center opacity-60 mt-3">No History</div>
        ))}

      {!allTransfers && (
        <div className="text-center">
          <Loader />
        </div>
      )}
    </div>
  )
}

export default History
