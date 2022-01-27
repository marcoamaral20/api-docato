const fetch = require('node-fetch')
const cheerio = require('cheerio')

const docatoUrl = 'https://docato.com.br/produto/destaques'

function getProducts(produtos){
    return fetch(`${docatoUrl}`)
    .then(response => response.text())
    .then(body => {

        const $ = cheerio.load(body)  
        const nome = $('<h2 class=h5 azul-escuro-docato>Otimização de políticas de acordo</h2>').text()
        const descricao = $('<h3 class="h6 cinza-footer"> Descobrir a melhor política de acordo em processos judiciais que traga mais eficiência para a corporação</h3>').text()
        const preco = 29.90
       
        const listaprodutos = []
            $('<div class="row 5-px">').each(function (i, element) {
                const $element = $(element)
                const title = $element.find('col-md-8 col-12 text-md-left text-center').attr('h2')
                listaprodutos.push(title)
            })
        
            

        const response = {
        nome,
        descricao,
        preco,
        }

        const  teste = {
            response, 
            listaprodutos
        }

        return response
})
}

module.exports = {
    getProducts
}