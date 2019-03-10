import { logger } from "."
import web3 from 'web3'
import { readFileSync } from 'fs'
import { getPath } from '../../../files'
import { TransactionReceipt } from "web3-core/types";
const Web3 = require('web3')
const Tx = require('ethereumjs-tx')

export interface IConfigParams {
    apikey: string
}

export class EthereumWeb3 {
    public connected: boolean = false
    private client: web3
    private contractABI: any
    private contractAddress = '0xe3b35eb49c56cc93314624f4563287b103101ad6'
    private contract

    constructor(options: IConfigParams) {
        const testnet = 'https://rinkeby.infura.io/4259c9265e2841b0b3943cafc3920608'
        const provider = new Web3.providers.HttpProvider(testnet)
        this.client = new Web3(provider)
        //this.client.eth.defaultAccount = '0xCEE267634114c3cc64Cd1e6C44DCFc84B0047B68'
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
    
    public async getBalanceAsync() {
        const weiResult = await this.client.eth.getBalance('0xCEE267634114c3cc64Cd1e6C44DCFc84B0047B68')
        logger.info(`Wei result => ${weiResult}`)
        return this.client.utils.fromWei(weiResult, 'ether')
    }

    public async transferAsync(from: string, fromPrivateKey: string, to: string, amount: any, gas: string, gasLimit: string) {
        ///https://web3js.readthedocs.io/en/1.0/web3-eth.html#sendtransaction
        const nouce = await this.client.eth.getTransactionCount(from)
        var rawTransaction = {
            to: this.contractAddress,
            value: '0x0',
            gasPrice: this.client.utils.toHex( this.client.utils.toWei('40', 'gwei') ),
            gasLimit: this.client.utils.toHex(210000),
            nonce: this.client.utils.toHex(nouce),
            data: this.contract.methods.transfer(to, this.client.utils.toWei('400', 'gwei')).encodeABI(),
        }
        var transaction = new Tx(rawTransaction);
        var privateKey = Buffer.from(fromPrivateKey , 'hex')
        await transaction.sign(privateKey)
        try {
            const transactionPromise = await this.client.eth.sendSignedTransaction('0x'+transaction.serialize().toString('hex'))
            logger.info(`Transaction promise => ${JSON.stringify(transactionPromise)}`)
            const toBalance = await this.contract.methods.balanceOf(to).call()
            const fromBalance = await this.contract.methods.balanceOf(from).call()
            logger.info(`ToBalance => ${toBalance}`)
            logger.info(`FromBalance => ${fromBalance}`)
            return transactionPromise    
        } catch (error) {
            logger.error(`ERROR => ${JSON.stringify(error)} - ${error}`)
        }
    }

    public async addAmmountToAccountAsync() {
        await this.client.eth.accounts.create();
    }
}

