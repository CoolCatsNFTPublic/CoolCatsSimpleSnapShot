const Web3 = require('web3');
const fs = require('fs');
const ABI = require('./abi.json');

// replace these constants with your own values
const CONTRACT_ADDRESS = '< YOUR CONTRACT ADDRESS HERE >';
const INFURA_KEY = '< YOUR API KEY HERE >';
const INFURA_WSS = 'wss://mainnet.infura.io/ws/v3/';
const WEB3_PROVIDER_SOCKET = INFURA_WSS + INFURA_KEY;

class SnapShotter {

    constructor() {
        this.web3;
        this.contract;
        this.init();
    }

    /**
     * Initialise the contract
     */
    init() {
        // we are in the server side and metmask is not available
        const provider = new Web3.providers.WebsocketProvider(WEB3_PROVIDER_SOCKET);
        this.web3 = new Web3(provider);
        this.contract = new this.web3.eth.Contract(ABI, CONTRACT_ADDRESS);

        // make sure the contract connected before continuing
        if(!this.contract) {
            console.log('didnt connect to the contract');
            return;
        }

        // all is well, start snapshot
        this.getAllHolders();
    }

    /**
     * Grab all the holders at time of running
     */
    async getAllHolders() {
        // get the current total supply of cats
        const totalSupply = await this.contract.methods.totalSupply().call();

        // create an object to hold all holders
        const holder = {};

        // iterate through all cats
        for(let i = 0; i < totalSupply; i++){

            // ask the contract who the current holder is
            const ownerAddress = await this.contract.methods.ownerOf(i).call();

            console.log('holder:', ownerAddress);
            // use holder addresses as object keys
            if(!holder[ownerAddress]){
                holder[ownerAddress] = 1;
            } else {
                holder[ownerAddress]++;
            }
        }

        // flatten the data and save
        const flatData = JSON.stringify(holder);
        fs.writeFile('./finalSnapShot/holders.json', flatData,{ flag: 'w' },function (err) {
            if (err) return console.log(err);
        });
    }
}

// start the show
const snapshotter = new SnapShotter();
