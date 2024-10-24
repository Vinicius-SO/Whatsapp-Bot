import qrcode from "qrcode-terminal"
import cron from 'node-cron'
import express from 'express'
import {Client, LocalAuth} from'./src/common/index.js'
import { Crypto } from './src/model/Crypto.js'


let pullMessage = true
let valorSolana = 950

const Bitcoin = new Crypto('Bitcoin', 'BTC')
const Solana = new Crypto('Solana', 'SOL')
const Ethereum = new Crypto('Ethereum', 'BTC')


const client = new Client({
  authStrategy: new LocalAuth({
      dataPath: './persist-data'
  })
});

client.on('qr', (qr) => {
  console.log(qr)
    qrcode.generate(qr, { small: true });
});


client.on('ready', () => {
  console.log('Cliente pronto!');

  // Agendando a tarefa para rodar a cada 30 segundos
  cron.schedule(' * * * * *', async() => {
    const formattedPrice = await Solana.fetchPrice()
    console.log(formattedPrice, valorSolana)

    if(formattedPrice < valorSolana){
      if(pullMessage === true){
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
      }
      const restartValue = valorSolana+ 5
      if(formattedPrice > restartValue){
        pullMessage = true
        console.log("ok")
      }
      
    }
  });
});


client.on('message_create', async (message) => {

  const chatData = await message.getChat()

  if(chatData.groupMetadata){

    if(chatData.groupMetadata.id._serialized == '120363332673166670@g.us'){

      const msg = message.body.toLowerCase();
      const infosArray = msg.split(/(\s+)/).filter( e => e.trim().length > 0)


      if (message.body.toLowerCase() === 'b') {
        const price = await Bitcoin.getPrice() 
        message.reply(`Bitcoin ${price}`);
      }
  
      if (message.body.toLowerCase() === 's') { 
        const price = await Solana.getPrice()
        message.reply(`Solana ${price}`);
      }

      if (message.body.toLowerCase() === 'e') {
        const price = await Ethereum.getPrice()
        message.reply(`Ethereum ${price}`);
      }



      //Define preço Solana
      if (infosArray[0].toLowerCase() === 'sol' && infosArray.length === 2) {
        valorSolana = infosArray[1]
        message.reply(`Alerta de sol ${valorSolana}`);
      }

      if (message.body.toLowerCase() === 'stop') {
        pullMessage = false
        console.log(`Alerta de sol pausado`);
      }

      if (message.body.toLowerCase() === 'start') {
        pullMessage = true
        console.log(`Alerta de sol`);
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
const PORT = process.env.PORT || 5000;

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