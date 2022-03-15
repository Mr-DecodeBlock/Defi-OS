/* eslint-disable react/prop-types */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/jsx-props-no-spreading */
import { Skeleton } from 'antd'
import Blockies from 'react-blockies'
import { useMoralis } from 'react-moralis'

/**
 * Shows a blockie image for the provided wallet address
 * @param {*} props
 * @returns <Blockies> JSX Elemenet
 */

function Blockie(props) {
  const { account, isAuthenticated } = useMoralis()
  if (!props.address && (!account || !isAuthenticated)) return <Skeleton.Avatar active size={40} />

  return (
    <Blockies
      seed={props.currentWallet ? props.account.toLowerCase() : props.address.toLowerCase()}
      className="identicon"
      {...props}
    />
  )
}

export default Blockie
