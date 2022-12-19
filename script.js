let box = document.querySelector('.pizza__list')


let dataServise = {
    orders : [],
    data   : [],

    getData: async function(url){
        let response = await fetch(url)
        let json =await response.json()
        this.data = json   
        console.log(this.data);     
        this.loadData()
    },   

    saveToLS: function(){
      
        localStorage.setItem('pizza', JSON.stringify(this.data) )
        localStorage.setItem('orders', JSON.stringify(this.orders) )
    },

    fromLS: function(){
        this.data = JSON.parse(localStorage.getItem('pizza'))
        this.orders = JSON.parse(localStorage.getItem('orders'))

        if (this.data) dataServise.loadData()
        else dataServise.getData('pizza.json')

        if(this.orders[0]){
            this.orders.forEach((el)=>{
                let newOrd = new Order(el.pizza)                
                for(let a in el){
                        if(!(a === 'elem')) newOrd[a] = el[a]                                              
                    }                   
                newOrd.filling()
            })  
        }
    },

    loadData: function(){
        this.data.forEach((pizza)=>{            
            let newPizza = new Pizza(box, pizza)
            newPizza.createCard()
            newPizza.hendler()
            newPizza.showRating()
        })
    }
} 





class Pizza{   
    div
    constructor(elem, obj){
        this.elem = elem
        this.obj = obj
    }
    
    createCard(){
        this.div = document.createElement('div')
        this.div.classList.add('card')
        let template = document.querySelector('#pizza__card').innerHTML       
        let render = Mustache.render(template, this.obj)
        this.div.innerHTML = render        
        this.elem.append(this.div)        
        this.reviseChose()
    }

    hendler(){
        let allsize = this.div.querySelectorAll('.diameter');
        let buy = this.div.querySelector('.buy')
        allsize.forEach((element, ind)=>{
            element.addEventListener('click',()=>{
                this.obj.size.forEach((el, i)=>{                    
                    if (i===ind) el.selected = true
                    else el.selected = false                    
                })
                console.log(this.obj.size);
                this.reviseChose()
            })
        })  
        buy.addEventListener('click', ()=>{
            new Order(this.obj)            
        })

        this.elem.addEventListener('click', ()=>{
            dataServise.saveToLS()
        })
    }

    reviseChose(){
        let item = this.div.querySelectorAll('.diameter')
        this.obj.size.forEach((element, ind)=>{
            if (element.selected){
                this.div.querySelector('.weight').innerHTML =element.weight + ' г'
                this.div.querySelector('.price').innerHTML =element.price + ' грн'
                item[ind].classList.add('diameter--active')
            }
            else item[ind].classList.remove('diameter--active')
        })      
    }

    showRating(){
       const rating = this.div.querySelector('.rating__value')
       const ratingField = this.div.querySelector('.rating__items')  
       const ratingStatus = this.div.querySelector('.rating__status')    
       ratingStatus.style.width = this.obj.rating*20 + '%'
       rating.innerHTML = this.obj.rating

       ratingField.addEventListener('mousemove', (e)=>{
           if(e.target.closest('.rating__item')){                
               ratingStatus.style.width = e.target.value*20 + "%"
            };        
        })
        
        ratingField.addEventListener('mouseout',()=>{
            ratingStatus.style.width = this.obj.rating*20 + '%'        
        })
        
        ratingField.addEventListener('click',(e)=>{
            if(e.target.closest('.rating__item')){               
                if(this.obj.rating === 0) this.obj.rating = e.target.value
                else this.obj.rating = Math.round((+this.obj.rating + +e.target.value)/2*10)/10                
                ratingStatus.style.width = this.obj.rating*20 + '%'
                rating.innerHTML = this.obj.rating
                console.log(dataServise.data[0].rating);                
            }
       })   
    }
}







class Order{
    static totalPrice = 0
    static pizzas = []     
    counter = 1;
    total = 0;
    addition =[]
    constructor(obj){
        this.pizza = obj
        this.filter(this.pizza)  
    }

    createCard(){
        let basket = document.querySelector('.scroll')
        this.elem = document.createElement('div')
        this.elem.classList.add('order')
        const template = document.querySelector('#mini-card').innerHTML
        const render = Mustache.render(template, this.pizza)        
        this.elem.innerHTML = render;
        basket.append(this.elem)        
    }

    filling(){      
        console.log(this.elem);  
        let count = this.elem.querySelector('.counter__inp')
        let price = this.elem.querySelector('.order__price')
        let total = document.querySelector('.total')
        let size = this.elem.querySelector('.diameter')
        count.value = this.counter
        this.totalPrice = this.price*this.counter
        price.innerHTML = this.totalPrice +'грн'
        size.innerHTML = this.diameter + 'см'
        Order.totalPrice = 0
        Order.pizzas.forEach((elem)=>{
            Order.totalPrice += elem.totalPrice
        })
        total.innerHTML = Order.totalPrice +' грн'       
    }

    filter({name, size}){   
        console.log(Order.pizzas);     
        if(!Order.pizzas.length){
            this.subconstr(name, size) 
            document.querySelector('.market__price').removeAttribute('style')
        }     
            
        else {
           if(Order.pizzas.some(el => el.name === name)){              
                let compare = Order.pizzas.find(el => el.name === name && el.diameter === size.find((elm)=>elm.selected).d)
                if (compare){
                    compare.counter++
                                       
                    compare.filling()
                }
                else this.subconstr(name, size)  
           }
           else this.subconstr(name, size)                    
        }            
    }

    subconstr(name, size){
        this.name = name
        let sub = size.find((el)=>el.selected)
        this.diameter = sub.d;
        this.price = sub.price
        Order.pizzas.push(this) 
        dataServise.orders = Order.pizzas       
        this.createCard()         
        this.filling()
        this.hendler()
    }

    hendler(){
        this.elem.querySelector('.order__delete').addEventListener('click', ()=>{
            let i = Order.pizzas.findIndex((el)=>el.name === this.name && this.diameter === el.diameter)
            Order.pizzas.splice(i,1);
            this.elem.remove()
            this.filling()
            console.log(Order.pizzas);
            if(Order.pizzas.length === 0)
            {
                document.querySelector('.market__price').style.display = 'none'
                localStorage.removeItem('orders')
            }
        })   
        
        this.elem.querySelector('.plus').addEventListener('click', ()=>{
            this.counter++
            this.filling()
        })
        this.elem.querySelector('.minus').addEventListener('click', ()=>{
            this.counter--
            if(this.counter<=0) this.counter = 0
            this.filling()
        })

        this.elem.addEventListener('click', ()=>{
            dataServise.saveToLS()
        })

       
    }    
}



let basket = document.querySelector('.basket')
let market = document.querySelector('.market')
let close = document.querySelector('.close')
close.addEventListener('click', ()=>{
    market.style.right =-550 +'px'   
})

basket.addEventListener('click', ()=>{
    market.style.right =0 +'px'
})

dataServise.fromLS()

