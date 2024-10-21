const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const cron = require('node-cron');
const express = require('express');

// equivalent to:
const client = new Client({
  authStrategy: new LocalAuth({
    clientId: "bot-session",
    dataPath: "./persist-data",  // Local onde os dados de sessão serão salvos
  })
});
client.on('qr', (qr) => {
  console.log(qr)
    qrcode.generate(qr, { small: true });
});


client.on('ready', () => {
  console.log('Cliente pronto!');

  // Agendando a tarefa para rodar a cada 30 segundos
  cron.schedule('*/10 * * * * *', async() => {
    const json = await fetch('https://api.binance.com/api/v3/avgPrice?symbol=SOLBRL')
    const brutePrice = await json.json()
    const formattedPrice = parseFloat(brutePrice.price).toFixed(0);

    const price = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(formattedPrice);


    if(formattedPrice < 770){

      const grupo = '120363332673166670@g.us'
      const mensagem = 'O preço da solana está abaixo, o atual preço é  ' + price;

      // Enviar a mensagem
      client.sendMessage(grupo, mensagem)
          .then(response => {
              console.log('Mensagem enviada com sucesso!');
          })
          .catch(err => {
              console.error('Erro ao enviar a mensagem: ', err);
          });
      }
  });
});
client.on('message_create', async (message) => {

  const chatData = await message.getChat()
  if(chatData.groupMetadata){
    if(chatData.groupMetadata.id._serialized == '120363332673166670@g.us'){
      if (message.body.toLowerCase().startsWith('b')) {
        const json = await fetch('https://api.binance.com/api/v3/avgPrice?symbol=BTCBRL')
        const brutePrice = await json.json()
        const formattedPrice = parseFloat(brutePrice.price).toFixed(2);
        //com R$
        const price = new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(formattedPrice);
  
        message.reply(`O valor do bitcoin está em ${price}`);
       
        // console.log(chatData.groupChat.groupMetadata.id._serialized)
      }
  
      if (message.body.toLowerCase().startsWith('s')) { 
        const json = await fetch('https://api.binance.com/api/v3/avgPrice?symbol=SOLBRL')
        const brutePrice = await json.json()
        const formattedPrice = parseFloat(brutePrice.price).toFixed(2);
        const price = new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(formattedPrice);
        message.reply(`O valor da solana está em ${price}`);
        // const chatData = await message.getChat()
        // console.log(chatData.groupChat.groupMetadata.id._serialized)
      }
      if (message.body.toLowerCase().startsWith('e')) {
        const json = await fetch('https://api.binance.com/api/v3/avgPrice?symbol=ETHBRL')
        const brutePrice = await json.json()
        const formattedPrice = parseFloat(brutePrice.price).toFixed(2);
        
        const price = new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(formattedPrice);
  
        message.reply(`O valor do Ethereum está em ${price}`);
        // const chatData = await message.getChat()
        // console.log(chatData.groupChat.groupMetadata.id._serialized)
      }
    }
  }
   
});

client.initialize();


// ADD This func to the ready response to get all your groups ids 
const groupID = async () => {
  // Get all chats
  const chats = await client.getChats();

  // Filtering all groups 
  const grupos = chats.filter(chat => chat.isGroup);

  //Display each group name and their id
  grupos.forEach(grupo => {
      console.log(`Nome do Grupo: ${grupo.name}, ID: ${grupo.id._serialized}`);
  });
};



const app = express();
const PORT = process.env.PORT || 3000;

// Rota para verificar o status do bot
app.get('/', (req, res) => {
    res.send('O bot do WhatsApp está rodando!');
});

// Adiciona mais informações sobre o status do cliente
app.get('/status', (req, res) => {
    if (client.info) {
        res.json({
            status: 'Bot está pronto',
            info: client.info
        });
    } else {
        res.json({ status: 'Bot ainda não está pronto' });
    }
});

// Inicia o servidor Express
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});