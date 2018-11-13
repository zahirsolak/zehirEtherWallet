import Service from '@ember/service';

export default Service.extend({
  language: 'en',
  resources: {
    'tr': {
      'applicationName':'Zehir Wallet',
      'network':"Ağ",
      'cs': {
        'password':'Şifre',
        'selectFile':'Dosya Seç',
        'selectKeyStoreFile':'Keystore Dosyası Seç',
        'questionForWalletAccessType':'Cüzdanınıza nasıl erişmek istersiniz?',
        'keyStoreFile':'Keystore Dosyası (UTC / JSON)',
        'pageTitle': 'Cold Staking İşlemleri - Testnet',
        'privateKey': 'Özel Anahtar',
        'loadWallet': 'Cüzdanı Yükle',
        'walletAdress': 'Cüzdan Adresi',
        'balance': 'Bakiye',
        'amount': 'Miktar',
        'contractAddress': 'Sözleşme Adresi',
        'changeWallet':'Cüzdan Değiştir',
        'sendAllToContract':'Tümünü Sözleşmeye Gönder',
        'sendToCsContract':'CS Sözleşmesine Gönder',
        'loadStakingInfo':'Staking Bilgisini Yükle',
        'stakeAmount':'Stake Miktarı',
        'currentRewards':'Şu Anki Ödül',
        'stakeTime':'Stake Zamanı',
        'withdrawStake':'Tüm Parayı Çek',
        'withdrawClaim':'Yalnızca Ödülü Çek',
        'refresh':'Yenile',
        'wallet':"Cüzdan",
        'coldStaking':'Cold Staking',
        'operations':'İşlemler / Loglar',
        'sendToCsContract_confirmMessage':'|amount| CLO cold staking akıllı sözleşmesine transfer edilecektir. Onaylıyor musunuz?',
        'sendToWalletConfirmMessage':"Aşağıda belirtilen cüzdan adresine |amount| CLO gönderilecektir. Onaylıyor musunuz? |walletAddress|",
        'privateKeyForTest':'Test için gerekli özel anahtarı girmek için buraya tıklayabilirsiniz.',
        'privateKeyForTesti_old':'Uygulamayı test etmek için aşağıda belirtilen özel anahtarı kullanabilirsiniz.',
        'transfer':'Transfer',
        'targetWalletAdress': 'Hedef Cüzdan Adresi',
        'amountToSend':'Gönderilecek Miktar',
        'sendToWallet':'Cüzdana Gönder'
      },
      'language':{
        'tr':'Türkçe',
        'en':'English'
      }
    },
    'en': {
      'applicationName':'Zehir Wallet',
      'network':"Network",
      'cs': {
        'password':'Password',
        'selectFile':'Select File',
        'selectKeyStoreFile':'Select Keystore File',
        'questionForWalletAccessType':'How would you like to access your wallet?',
        'keyStoreFile':'Keystore File (UTC / JSON)',
        'pageTitle': 'Cold Staking Operations - Testnet',
        'privateKey': 'Private Key',
        'loadWallet': 'Load Wallet',
        'walletAdress': 'Wallet Address',
        'balance': 'Balance',
        'amount': 'Amount',
        'contractAddress': 'Contract Address',
        'changeWallet':'Change Wallet',
        'sendAllToContract':'Send All To Contract',
        'sendToCsContract':'Send To CS Contract',
        'loadStakingInfo':'Load Staking Information',
        'stakeAmount':'Stake Amount',
        'currentRewards':'Current Rewards',
        'stakeTime':'Stake Time',
        'withdrawStake':'Withdraw All Coins',
        'withdrawClaim':'Withdraw Only Claim',
        'refresh':'Refresh',
        'wallet':"Wallet",
        'coldStaking':'Cold Staking',
        'operations':'Operations / Logs',
        'sendToCsContract_confirmMessage':'|amount| CLO will be transferred to cold staking smart contract. Do you approve?',
        'sendToWalletConfirmMessage':"|amount| CLO will be sent to the wallet address mentioned below. Do you approve? |walletAddress|",  
        //'privateKeyForTest':'You can click here to enter the private key required to test the application.',  
        'privateKeyForTest':'You can click here to enter required private key for testing.',    
        //'privateKeyForTest_old':'You can use the following private key to test the application.',
        'transfer':'Transfer',
        'targetWalletAdress': 'Target Wallet Adress',
        'amountToSend':'Amount To Send',
        'sendToWallet':'Send To Wallet'
      },
      'language':{
        'tr':'Türkçe',
        'en':'English'
      }
    }
  },
  getResource: function (key) {
    var resourceKey = `resources.${this.get('language')}.${key}`;
    var resourceValue = this.get(resourceKey);
    if (resourceValue) return resourceValue;
    return resourceKey;
  }
});
