import { logger } from "."
import web3 from 'web3'
import { readFileSync } from 'fs'
import { getPath } from '../../../files'
import { IResolver } from './IResolver'
import * as rp from 'request-promise'
const Web3 = require('web3')
const Tx = require('ethereumjs-tx')
const etherscan = require('etherscan-api')

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
    private etherscanApikey: string
    private etherscanNetwork: string
    private api

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
        this.api = etherscan.init(this.etherscanApikey, 'rinkeby', '3000')
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
        const weiResult = await this.api.account.tokenbalance(address, '', this.contractAddress)
        return this.client.utils.fromWei(weiResult.result, 'gwei')
    }

    public async addFreeFuelAmountAsync(to: string, amount: number) {
        try {
            ///https://web3js.readthedocs.io/en/1.0/web3-eth.html#sendtransaction
            const nouce = await this.client.eth.getTransactionCount(this.fromAddress)
            var rawTransaction = {
                to,
                value: this.client.utils.toHex(this.client.utils.toWei(`${amount}`, 'gwei')),
                gasPrice: this.client.utils.toHex(this.client.utils.toWei('40', 'gwei')),
                gasLimit: this.client.utils.toHex(210000),
                nonce: this.client.utils.toHex(nouce),
            }
            var transaction = new Tx(rawTransaction);
            var privateKey = Buffer.from(this.fromPK, 'hex')
            await transaction.sign(privateKey)
            const transactionPromise = await this.client.eth.sendSignedTransaction('0x' + transaction.serialize().toString('hex'))
            return transactionPromise
        } catch (error) {
            logger.error(`ERROR => ${JSON.stringify(error)} - ${error}`)
            throw Error('Transaction failed')
        }
    }

    public async transferCoopiesAsync(to: string, amount: number, from?: string, fromPK?: string) {
        try {
            const fromAddress = from ? from : this.fromAddress
            const fromKey = fromPK ? fromPK : this.fromPK
            ///https://web3js.readthedocs.io/en/1.0/web3-eth.html#sendtransaction
            const nouce = await this.client.eth.getTransactionCount(fromAddress)
            var rawTransaction = {
                to: this.contractAddress,
                value: '0x0',
                gasPrice: this.client.utils.toHex(this.client.utils.toWei('40', 'gwei')),
                gasLimit: this.client.utils.toHex(210000),
                nonce: this.client.utils.toHex(nouce),
                data: this.contract.methods.transfer(to, this.client.utils.toWei(`${amount}`, 'gwei')).encodeABI(),
            }
            var transaction = new Tx(rawTransaction);
            var privateKey = Buffer.from(fromKey, 'hex')
            await transaction.sign(privateKey)
            const transactionPromise = await this.client.eth.sendSignedTransaction('0x' + transaction.serialize().toString('hex'))
            return transactionPromise
        } catch (error) {
            logger.error(`ERROR => ${JSON.stringify(error)} - ${error}`)
            throw Error('Transaction failed')
        }
    }

    public async getTransactionsByAccount(address: string): Promise<IRinkebyResponse> {
        const etherscanResponse: IRinkebyResponse = await this.api.account.txlist(address, 1, 'latest', 1, 100, 'asc')
        this.toCoopies(etherscanResponse)
        return etherscanResponse
    }

    private toCoopies(transactions: IRinkebyResponse) {
        transactions.result.map((t) => {
            t.value = this.client.utils.fromWei(t.value, 'gwei')
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

