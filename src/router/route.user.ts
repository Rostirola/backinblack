import { Router } from "express";
import { randomUUID } from "node:crypto";
import { Database } from "../database";

const userRoute = Router();
const database = new Database();
const table = "user"; 
 
//Recuperar todos os usuarios
userRoute.get("/", (requeste, response) => {

  const user = database.select(table);

  response
          .json(user);

});

//Recuperar usuario pelo id
userRoute.get("/:id", (request, response) => {

  const { id } = request.params;
  const result = database.select(table, id);

  if (result === undefined)
    response
            .status(400)
            .json({ msg: "Usuário não encontrado!" });

  response
          .json(result);

});

//Inserção de usuário no banco
userRoute.post("/", (request, response) => {

  const {nome, cpf, email, telefone, cep} = request.body;
  const user = {
    id: randomUUID(),
    nome,
    cpf,
    email,
    telefone,
    cep,
    saldo: 0,
    transacao: []
  };
 
  database.insert(table, user);

  response
          .status(201)
          .json({ msg: "sucesso!" });

});

//Atualizar usuário
userRoute.put("/:id", (request, response) => {

  const { id } = request.params;
  const { nome, cpf, email, telefone, cep } = request.body;
  const userExist: any = database.select(table, id);
  const user:any = {nome, cpf, email, telefone, cep};
  const filteredUser: any = {};

  if (userExist === undefined)
    return response
                    .status(400)
                    .json({ msg: "Usuário não encontrado!" });

  for (const key in user)
    if (user[key] !== undefined)
      filteredUser[key] = user[key];

   const infoDatabase:any = {...userExist, ...filteredUser}

   database.update(table, id, infoDatabase);

   response
            .status(202)
            .json({msg: `Sucesso! O usuário ${userExist.nome} teve alterações no sistema.`});

});

//ADICIONAR DINHEIRO AO USUÁRIO:
userRoute.put('/deposito/:id', (request,response)=>{

  const { id } = request.params;
  const {tipo, valor} = request.body;
  const userExist:any = database.select(table, id);
  const nome = userExist.nome;
  let transacao = userExist.transacao;
  let saldo = userExist.saldo;

  if(userExist === undefined)
    return response
                    .status(400)
                    .json({msg:'Erro! Esse usuário não foi encontrado no sistema.'});

  transacao.push({tipo, valor});

  database.update(table, id, {id, nome, saldo: saldo + Number(valor), transacao});

  response
          .status(201)
          .json({msg: `Sucesso! Foi depositado o valor de R$${valor}, na conta do usuário: ${nome}` });

});

//RETIRAR DINHEIRO DO USUÁRIO:
userRoute.put('/retirada/:id', (request,response)=>{
  
  const { id } = request.params;
  const {tipo, valor} = request.body;
  const userExist:any = database.select(table, id);
  const nome = userExist.nome;
  let transacao = userExist.transacao;
  let saldo = userExist.saldo;
  
  if(userExist === undefined)
    return response
                   .status(400)
                    .json({msg:'Erro! Esse usuário não foi encontrado no sistema.'});

  if(userExist.saldo >= Number(valor)) {

    transacao.push({tipo, valor});

    database.update(table, id, {id, nome, saldo: saldo - Number(valor), transacao});

    response
            .status(201)
            .json({msg: `Sucesso! Foi retirado o valor de R$${valor}, do usuário: ${nome}.`});

    } else {

      response
              .status(404)
              .json({msg: `Erro! Você não pode retirar mais dinheiro do que possui.`});

    }
    
});

//Deletar usuário do banco
userRoute.delete("/:id", (request, response) => {

  const { id } = request.params;
  const userExist: any = database.select(table, id);

  if (userExist === undefined)
    return response.status(400).json({ msg: "Usuário não encontrado!" });

  database.delete(table, id);

  response
          .status(202)
          .json({ msg: `Usuário ${userExist.nome} foi deletado do banco` });

});

export { userRoute };