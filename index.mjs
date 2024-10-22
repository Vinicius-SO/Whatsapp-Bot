import qrcode from "qrcode-terminal"
import cron from 'node-cron'
import express from 'express'
import {Client, LocalAuth} from'./src/model/index.js'

let isMsgPullCanceled = false 
let valorSolana = 950


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
  cron.schedule('* * * * *', async() => {
    const json = await fetch('https://api.binance.com/api/v3/avgPrice?symbol=SOLBRL')
    const brutePrice = await json.json()
    const formattedPrice = parseFloat(brutePrice.price).toFixed(0);

    const price = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(formattedPrice);

    console.log(formattedPrice, valorSolana)

    if(formattedPrice < valorSolana && isMsgPullCanceled == false){

      const grupo = '120363332673166670@g.us'
      const mensagem = 'Sol abaixo de ' + valorSolana;

      // Enviar a mensagem
      client.sendMessage(grupo, mensagem)
          .then(response => {
              console.log('Mensagem enviada com sucesso!');
          })
          .catch(err => {
              console.error('Erro ao enviar a mensagem: ', err);
          });
      }else if(formattedPrice < (valorSolana + 5) && isMsgPullCanceled == false) {

      }
  });
});


client.on('message_create', async (message) => {

  const chatData = await message.getChat()
  if(chatData.groupMetadata){

    if(chatData.groupMetadata.id._serialized == '120363332673166670@g.us'){
      if (message.body.toLowerCase() === 'b') {
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
  
        message.reply(`Bitcoin ${price}`);
       
        // console.log(chatData.groupChat.groupMetadata.id._serialized)
      }
  
      if (message.body.toLowerCase() === 's') { 
        const json = await fetch('https://api.binance.com/api/v3/avgPrice?symbol=SOLBRL')
        const brutePrice = await json.json()
        const formattedPrice = parseFloat(brutePrice.price).toFixed(2);
        const price = new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(formattedPrice);
        message.reply(`Solana ${price}`);
      
      }

      if (message.body.toLowerCase() === 'e') {
        const json = await fetch('https://api.binance.com/api/v3/avgPrice?symbol=ETHBRL')
        const brutePrice = await json.json()
        const formattedPrice = parseFloat(brutePrice.price).toFixed(2);
        
        const price = new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(formattedPrice);
  
        message.reply(`Ethereum ${price}`);
      }
   
      if (message.body.toLowerCase().startsWith('def sol')) {
        let msg = message.body.toLowerCase();
        infosArray = msg.split(/(\s+)/).filter( e => e.trim().length > 0)

        valorSolana = infosArray[2]

        message.reply(`Alerta de sol ${valorSolana}`);
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
//

// Inicia o servidor Express
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});