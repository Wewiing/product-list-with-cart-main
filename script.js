const jsonUrl = './data.json';
const order = [];

// Función para cargar productos
async function loadProducts() {
    try {
        const response = await fetch(jsonUrl);
        const products = await response.json();

        const container = document.getElementById('products'); 
        container.innerHTML = ''; // Limpia el contenedor

        products.forEach(product => {
            // Crea la tarjeta para cada producto
            const card = document.createElement('div');
            card.classList.add('card');

            // Usar <picture> para imágenes responsivas
            const picture = `
                <picture>
                    <source srcset="${product.image.desktop}" media="(min-width: 1024px)">
                    <source srcset="${product.image.tablet}" media="(min-width: 768px)">
                    <source srcset="${product.image.mobile}" media="(max-width: 767px)">
                    <img class="product-image" src="${product.image.thumbnail}" alt="${product.name}">
                </picture>
            `;

            // Contenido de la tarjeta
            const content = `
                <div class="card-content">
                    <p class="category">${product.category}</p>
                    <p class="name">${product.name}</p>
                    <p class="price">$${product.price.toFixed(2)}</p>

                    <div class="cart-button">
                        <button class="add-to-cart">
                        <svg xmlns="http://www.w3.org/2000/svg" width="21" height="20" fill="none" viewBox="0 0 21 20"><g fill="#C73B0F" clip-path="url(#a)"><path d="M6.583 18.75a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5ZM15.334 18.75a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5ZM3.446 1.752a.625.625 0 0 0-.613-.502h-2.5V2.5h1.988l2.4 11.998a.625.625 0 0 0 .612.502h11.25v-1.25H5.847l-.5-2.5h11.238a.625.625 0 0 0 .61-.49l1.417-6.385h-1.28L16.083 10H5.096l-1.65-8.248Z"/><path d="M11.584 3.75v-2.5h-1.25v2.5h-2.5V5h2.5v2.5h1.25V5h2.5V3.75h-2.5Z"/></g><defs><clipPath id="a"><path fill="#fff" d="M.333 0h20v20h-20z"/></clipPath></defs></svg>
                        <span>Add to Cart</span>
                        </button>
                        <div class="quantity-control">
                            <button class="decrement">-</button>
                            <span class="quantity">0</span>
                            <button class="increment">+</button>
                        </div>
                    </div> 
                </div>`;
            
            // Inyectar HTML en la tarjeta
            card.innerHTML = picture + content;
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error al cargar los productos:', error);
    }
}

//Carga imagenes de productos para el modal
async function loadThumbnailImgs(productName) {
    try {
        const response = await fetch(jsonUrl); // Reemplaza jsonUrl con la URL real de tu archivo JSON
        const products = await response.json();

        // Encuentra el producto cuyo nombre coincide con productName
        const product = products.find(p => p.name === productName);

        // Si se encuentra el producto, retorna la URL del thumbnail
        if (product && product.image && product.image.thumbnail) {
            return product.image.thumbnail;
        } else {
            throw new Error(`Producto "${productName}" no encontrado o no tiene imagen de miniatura.`);
        }
    } catch (error) {
        console.error('Error al cargar las imágenes del producto:', error);
        throw error; // Lanza el error para que pueda ser manejado fuera de la función si es necesario
    }
}

function quantityControlMenu() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        const decrementBtn = card.querySelector('.decrement');
        const incrementBtn = card.querySelector('.increment');
        const quantityDisplay = card.querySelector('.quantity');

        const addToCartBtn = card.querySelector('.add-to-cart');
        const quantityControlBtns = card.querySelector('.quantity-control');
        const productImage = card.querySelector('.product-image');

        // Control de cantidad esté oculto inicialmente
        quantityControlBtns.style.display = 'none';

        addToCartBtn.addEventListener('click', () => {
            addToCartBtn.style.display = 'none';
            quantityControlBtns.style.display = 'flex'; // Mostrar el control de cantidad
            productImage.style.border = '4px solid hsl(14, 86%, 42%)';
            productImage.style.borderRadius = '10px';
            quantityDisplay.textContent = 1;
            updateOrder();
        });

        const updateOrder = () => {
            generateOrderList();
            updateCart();
            setupRemoveButtons();
        };

        // Incremento "+"
        incrementBtn.addEventListener('click', () => {
            const currentQuantity = parseInt(quantityDisplay.textContent, 10);
            quantityDisplay.textContent = currentQuantity + 1;
            updateOrder();
        });

        // Decremento "-"
        decrementBtn.addEventListener('click', () => {
            const currentQuantity = parseInt(quantityDisplay.textContent, 10);
            if (currentQuantity > 0) {
                quantityDisplay.textContent = currentQuantity - 1;
                updateOrder();
            }

            // Si la cantidad llega a 0, revertimos al botón "Add to Cart"
            if (currentQuantity - 1 === 0) {
                addToCartBtn.style.display = 'flex'; // Mostrar el botón de agregar al carrito
                quantityControlBtns.style.display = 'none'; // Ocultar el control de cantidad
                productImage.style.border = 'none';
                productImage.style.borderRadius = '8px';
            }
        });
    });
}

//Actualiza la order-list
function generateOrderList() {
    const cards = document.querySelectorAll('.card');
    order.splice(0,order.length); //limpia toda la order list

    cards.forEach(card => {
        const name = card.querySelector('.name').textContent;
        const price = parseFloat(card.querySelector('.price').textContent.replace('$', ''));
        const quantity = parseInt(card.querySelector('.quantity').textContent, 10);

        if (quantity > 0) {
            order.push({
                name,
                quantity,
                price
            });
        }
    });
}

//Actualiza el carrito
function updateCart(){

    const cartList = document.querySelector('.cart-list');
    //Resetea la cart-list
    cartList.textContent= '';

    //contador del total de productos para cart-title
    let totalProducts = 0;
    let totalPrice = 0;
    
    if (order.length > 0){

        document.querySelector('.empty-message').style.display = 'none'; //Remove the empty cart message
        document.querySelector('.confirm-order').style.display = 'block'; //Display the button confirm order
        document.querySelector('.delivery-message').style.display = 'flex'; //Display the delivery message

        order.forEach(item =>{
                 
            const listItem = document.createElement('li');
            listItem.classList.add('item');
            

            totalProducts+= item.quantity;
            totalPrice+= item.price*item.quantity;

            const content= `
                <div>
                    <p class="title">${item.name}</p>
                    <span class="quantity">${item.quantity}x</span>
                    <span class="individual-price">@$${item.price}</span>
                    <span class="total-price">$${(item.price*item.quantity)}</span>
                </div>
            `;

            const removeButton = `
                <button class="remove-button">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 10 10"><path fill="#CAAFA7" d="M8.375 9.375 5 6 1.625 9.375l-1-1L4 5 .625 1.625l1-1L5 4 8.375.625l1 1L6 5l3.375 3.375-1 1Z"/></svg>
                </button>
            `;

            listItem.innerHTML = content + removeButton;
            cartList.appendChild(listItem)
        });

        //Actualiza cantidad de productos en el titulo del carrito
        const cartTitle = document.querySelector('.cart .title');
        cartTitle.textContent = cartTitle.textContent.replace(/\(\d+\)/, `(${totalProducts})`);

        //Actualiza precio total del carrito
        document.querySelector('.cart .order-total').innerHTML = `
            <span class = "description">Order Total</span>
            <span class = "value">$${totalPrice}</span>
        `;
    }else{
        //Actualiza el numero de productos que aparecen en el titulo del carrito a "0"
        document.querySelector('.cart .title').textContent = 'Your Cart (0)';
        //Elimina el texto del total de la orden
        document.querySelector('.cart .order-total').textContent = '';
        //Muestra nuevamente el empty message
        document.querySelector('.empty-message').style.display = 'flex'
        //Elimina el boton de confirm order
        document.querySelector('.confirm-order').style.display = 'none';
        document.querySelector('.delivery-message').style.display = 'none';
    }
}

//Configura los botones de remove de cada item
function setupRemoveButtons() {
    const items = document.querySelectorAll('.cart-list .item'); // Selecciona los elementos en el carrito actuales
    items.forEach(item => {
        const removeBtn = item.querySelector('.remove-button');
        if (removeBtn) { // Verifica si existe el botón
            removeBtn.addEventListener('click', () => {
                const productName = item.querySelector('.title').textContent;
                
                // Elimina el producto del array `order`
                const index = order.findIndex(element => element.name === productName);
                if (index !== -1) {
                    order.splice(index, 1); // Elimina el elemento del array
                }

                updateCart(); // Actualiza el carrito con la nueva orden
                setupRemoveButtons(); // Reconfigura botones con la orden actualizada

                // Actualiza el menú (botones add-to-cart)
                const cardNames = document.querySelectorAll('.card .name');
                cardNames.forEach(cardName => {
                    if (cardName.textContent === productName) {
                        const cardContent = cardName.closest('.card-content');
                        const quantity = cardContent.querySelector('.cart-button .quantity');
                        quantity.textContent = 0;
                    }
                });
            });
        }
    });
}

//Muestra el carrito confirmado
async function displayConfirmedCart(){
    const confirmedCart = document.querySelector('.confirmed-cart');
    confirmedCart.innerHTML = ''; // Limpiar antes de agregar

    let totalOrderPrice = 0;
    // Muestra el carrito confirmado (lista)
    for (const item of order) {
        const listItem = document.createElement('li');
        listItem.classList.add('item');

        const productImage = await loadThumbnailImgs(item.name); // Usar `await` aquí

        totalOrderPrice+= item.price*item.quantity;

        // Añadir imagen del producto
        const content = `
            <div class="description">
                <img src="${productImage}" alt="${item.name} thumbnail" class="thumbnail">
                <div>
                <p class="name">${item.name}</p>
                <span class="quantity">${item.quantity}x</span>
                <span class="individual-price">@$${item.price}</span>
                </div>
            </div>
            <div class="total-price">$${(item.price * item.quantity)}</div>
        `;

        listItem.innerHTML = content;
        confirmedCart.appendChild(listItem);
    }

    document.getElementById('value').textContent='$' + totalOrderPrice;

}

//Configura el boton de confirmedOrderButton
function setupConfirmOrderButton() {
    const confirmOrderBtn = document.querySelector('.cart .confirm-order'); // Botón de confirmación en el carrito
    const modalOrderConfirmation = document.getElementById('order-confirmed-dialog'); // Modal de confirmación
    const closeModalBtn = document.querySelector('.new-order-btn'); // Botón para empezar una nueva orden

    // Elimina cualquier manejador previo antes de añadir uno nuevo
    confirmOrderBtn.replaceWith(confirmOrderBtn.cloneNode(true));
    const newConfirmOrderBtn = document.querySelector('.cart .confirm-order');

    newConfirmOrderBtn.addEventListener('click', async () => {
        modalOrderConfirmation.showModal();
        document.body.classList.add('modal-open'); // Añade la clase para bloquear el scroll
        await displayConfirmedCart();
    });

    closeModalBtn.addEventListener('click', () => { // Cierra el modal y resetea el menú y carrito
        modalOrderConfirmation.close();
        document.body.classList.remove('modal-open'); // Elimina la clase para desbloquear el scroll
        resetCart();
    });

    modalOrderConfirmation.addEventListener('click', (event) => { // Cierra el modal sin hacer cambios en el carrito ni el menú
        if (event.target === modalOrderConfirmation) {
            modalOrderConfirmation.close();
            document.body.classList.remove('modal-open'); // Elimina la clase para desbloquear el scroll
        }
    });
}

function setupEventHandlers() {
    // Configurar controles de cantidad
    quantityControlMenu();
    
    // Configurar botones de eliminación
    setupRemoveButtons();
    
    // Configurar botón de confirmar orden
    setupConfirmOrderButton();
}

function resetMenu(){
    // Resetear cantidades en el menú de productos
    const quantities = document.querySelectorAll('.cart-button .quantity');
    quantities.forEach(quantity => quantity.textContent = '0');

    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        const decrementBtn = card.querySelector('.decrement');
        const incrementBtn = card.querySelector('.increment');

        card.querySelector('.add-to-cart').style.display='flex';
        card.querySelector('.quantity-control').style.display='none'
        card.querySelector('.product-image').style.border='none'
        card.querySelector('.product-image').style.borderRadius='8px'
        
        //Elmina los eventos asociados a los quantityControls de Menu
        incrementBtn.replaceWith(incrementBtn.cloneNode(true));
        decrementBtn.replaceWith(decrementBtn.cloneNode(true));
    });

}

function resetCart() {
    // Limpiar la orden
    order.splice(0, order.length);
    
    // Reset Menu UI and delete quantity controls events
    resetMenu();

    // Update UI
    updateCart();
    setupEventHandlers();
}

async function main() {
    await loadProducts();
    setupEventHandlers();
    updateCart();
}
main();