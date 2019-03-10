import { logger } from "."
import web3 from 'web3'
import { readFileSync } from 'fs'
import { getPath } from '../../../files'
import { TransactionReceipt } from "web3-core/types";
const Web3 = require('web3')
const Tx = require('ethereumjs-tx')

export interface IConfigParams {
    contractAddress: string
    fromAddress: string
    fromPK: string
    toAddress: string
    provider: string
}

export class EthereumWeb3 {
    public connected: boolean = false
    private client: web3
    private contractABI: any
    private contractAddress: string
    private contract
    private fromAddress: string
    private fromPK: string
    private toAddress: string

    constructor(options: IConfigParams) {
        this.fromAddress = options.fromAddress
        this.fromPK = options.fromPK
        this.toAddress = options.toAddress 
        this.contractAddress = options.contractAddress
        const testnet = options.provider
        const provider = new Web3.providers.HttpProvider(testnet)
        this.client = new Web3(provider)
        this.contractABI = JSON.parse(readFileSync(getPath().replace('/files', '') + '/Coopi.json', 'utf8'))
        this.contract = new this.client.eth.Contract(this.contractABI, this.contractAddress)
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
        const weiResult = await this.client.eth.getBalance(address)
        return this.client.utils.fromWei(weiResult, 'gwei')
    }

    public async transferAsync(amount: any) {
        try {
            ///https://web3js.readthedocs.io/en/1.0/web3-eth.html#sendtransaction
            const nouce = await this.client.eth.getTransactionCount(this.fromAddress)
            var rawTransaction = {
                to: this.contractAddress,
                value: '0x0',
                gasPrice: this.client.utils.toHex( this.client.utils.toWei('40', 'gwei') ),
                gasLimit: this.client.utils.toHex(210000),
                nonce: this.client.utils.toHex(nouce),
                data: this.contract.methods.transfer(this.toAddress, this.client.utils.toWei(amount, 'gwei')).encodeABI(),
            }
            var transaction = new Tx(rawTransaction);
            var privateKey = Buffer.from(this.fromPK , 'hex')
            await transaction.sign(privateKey)
            const transactionPromise = await this.client.eth.sendSignedTransaction('0x'+transaction.serialize().toString('hex'))
            return transactionPromise    
        } catch (error) {
            logger.error(`ERROR => ${JSON.stringify(error)} - ${error}`)
            throw Error('Transaction failed')
        }
    }

    public async addAmmountToAccountAsync() {
        await this.client.eth.accounts.create();
    }
}

