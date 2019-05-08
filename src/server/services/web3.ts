import { logger, pusher } from '.'
import web3 from 'web3'
import { readFileSync } from 'fs'
import { getPath } from '../../../files'
import { IResolver } from './IResolver'
import { ErrorPayload } from '../errorPayload';
// tslint:disable-next-line: no-var-requires
const apiTemplate = require('etherscan-api')
// tslint:disable-next-line: no-var-requires
const Web3 = require('web3')
// tslint:disable-next-line: no-var-requires
const Tx = require('ethereumjs-tx')

export interface IConfigParams {
    contractAddress: string
    fromAddress: string
    fromPK: string
    toAddress: string
    provider: string
    etherscanApikey: string
    etherscanNetwork: string
}

export class EthereumWeb3 implements IResolver {
    public connected: boolean = false
    private client: web3
    private contractABI: any
    private contractAddress: string
    private contract
    private fromAddress: string
    private fromPK: string
    private etherscanAPI
    private etherscanApikey: string
    private etherscanNetwork: string

    constructor(options: IConfigParams) {
        this.fromAddress = options.fromAddress
        this.fromPK = options.fromPK
        this.etherscanApikey = options.etherscanApikey
        this.etherscanNetwork = options.etherscanNetwork
        this.contractAddress = options.contractAddress
        const testnet = options.provider
        const provider = new Web3.providers.HttpProvider(testnet)
        this.client = new Web3(provider)
        this.contractABI = JSON.parse(readFileSync(getPath().replace('/files', '') + '/Coopi.json', 'utf8'))
        this.contract = new this.client.eth.Contract(this.contractABI, this.contractAddress)
        this.etherscanAPI = apiTemplate.init(this.etherscanApikey, 'rinkeby')
        logger.info(`Ethereum component => On`)
    }

    public async getAccountsAsync() {
        return await this.client.eth.accounts
    }

    public createAccountAsync() {
        const personalAccount = this.client.eth.accounts.create()
        logger.info(`Account => ${JSON.stringify(personalAccount)}`)
        return personalAccount
    }

    public async getBalanceAsync(address: string) {
        const etherscanBalance = await this.etherscanAPI.account.tokenbalance(address, '', this.contractAddress)
        return this.client.utils.fromWei(etherscanBalance.result, 'shannon')
    }

    public async getFuelBalanceAsync(address: string) {
        const etherBalance = await this.etherscanAPI.account.balance(address)
        return this.client.utils.fromWei(etherBalance.result, 'shannon')
    }

    public async addFreeFuelAmountAsync(to: string, amount: number) {
        try {
            ///https://web3js.readthedocs.io/en/1.0/web3-eth.html#sendtransaction
            const nouce = await this.client.eth.getTransactionCount(this.fromAddress)
            const rawTransaction = {
                to,
                value: this.client.utils.toHex(this.client.utils.toWei(`${amount}`, 'shannon')),
                gasPrice: this.client.utils.toHex(this.client.utils.toWei('40', 'shannon')),
                gasLimit: this.client.utils.toHex(210000),
                nonce: this.client.utils.toHex(nouce),
            }
            const transaction = new Tx(rawTransaction)
            const privateKey = Buffer.from(this.fromPK, 'hex')
            await transaction.sign(privateKey)
            const transactionPromise = await this.client.eth.sendSignedTransaction('0x' + transaction.serialize().toString('hex'))
            return transactionPromise
        } catch (error) {
            logger.error(`ERROR => ${JSON.stringify(error)} - ${error}`)
            throw Error('Transaction failed - addFreeFuelAmountAsync')
        }
    }

    public async transferCoopiesAsync(to: string, amount: number, from?: string, fromPK?: string) {
        try {
            const fromAddress = from ? from : this.fromAddress
            //Remove the '0x' prefix from the pk
            const fromKey = fromPK ? Buffer.from(fromPK.substr(2), 'hex') : Buffer.from(this.fromPK, 'hex')
            ///https://web3js.readthedocs.io/en/1.0/web3-eth.html#sendtransaction
            const nouce = await this.client.eth.getTransactionCount(fromAddress)
            const gasPrice = this.client.utils.toWei(`10`, 'shannon')
            const gasLimit = '80000'//Units not GWEI | shannon
            const rawTransaction = {
                to: this.contractAddress,
                value: '0x0',
                //For help use https://ethgasstation.info/
                gasPrice: this.client.utils.toHex(gasPrice),
                gasLimit: this.client.utils.toHex(gasLimit),
                nonce: this.client.utils.toHex(nouce),
                data: this.contract.methods.transfer(to, this.client.utils.toWei(`${amount}`, 'shannon')).encodeABI(),
            }
            const transaction = new Tx(rawTransaction)
            await transaction.sign(fromKey)
            return this.client.eth.sendSignedTransaction('0x' + transaction.serialize().toString('hex'))
                .catch((err) => {
                    logger.error(`Se rompio todo => ${JSON.stringify(err)} -  ${err}`)
                    throw new Error()
                    //return { success: false }
                })
                .then((result) => {
                    logger.info(`Completed transaction`)
                    return { ...result, success: true }
                })
        } catch (error) {
            logger.error(`ERROR => ${JSON.stringify(error)} - ${error}`)
            throw Error('Transaction failed - transferCoopiesAsync')
        }
    }

    public async getTransactionsByAccount(address: string): Promise<IRinkebyResponse> {
        const transactions = await this.etherscanAPI.account.tokentx(address, undefined, 1, 'latest', 'asc')
        this.toCoopies(transactions)
        return transactions
    }

    private toCoopies(transactions: IRinkebyResponse) {
        transactions.result.map((t) => {
            t.value = this.client.utils.fromWei(t.value, 'shannon')
        })
    }
}

interface IRinkebyResponse {
    status: string,
    result: Array<{
        from: string,
        to: string,
        value: string,
        isError: string,
        contractAddress: string,
    }>
}
