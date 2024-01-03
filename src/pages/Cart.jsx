import { useCallback, useState, useEffect, useContext } from "react";
import { CiShoppingCart } from "react-icons/ci";
import { Link } from "react-router-dom";
import { AuthContext } from "../components/AuthContext";


const Cart = ({cart, setCart, cartCount, setCartCount}) => {
    
    const {userId, authToken} =useContext(AuthContext);
    const [selectedProduct, setSelectedProduct]= useState(null);
    const [quantities, setQuantities] = useState({});
    const [checkoutData, setCheckoutData]= useState({});

    const handleCheckoutData=(prop, event)=>{
        setCheckoutData({...checkoutData, [prop]: event.target.value})
    }

    const handleQuantityChange = useCallback((itemId, quantity) => {
        const newQuantities = {
        ...quantities,
        [itemId]: isNaN(quantity) ? 1 : quantity,
        };
        setQuantities(newQuantities);
    },[quantities]
    );

    // useEffect(()=>{
    //     const fetchCart= async ()=>{
    //         try {
    //             const response = await fetch(`http:localhost/api/cart?userId=${userId}`, {
    //                 method: "GET",
    //                 headers: {
    //                     'Authorization': `Bearer ${authToken}`,
     //                    'Content-Type': 'application/json'
    //                      
    //                 }
    //             });
    
    //             if (response.ok) {
    //                 const cartData = await response.json();
    //                 setCart(cartData);
    //                 setCartCount(cartData.length);
    //             }
    //         } catch (error) {
    //             console.error("Error fetching cart:", error);
    //         }
    //     };

    //     fetchCart();
    // }, [userId])

    const calculateTotalPrice = () => {
        let totalPrice = 0;
        cart.forEach((item) => {
        const quantity = quantities[item._id] || 1;
        totalPrice += item.price * quantity;
        });

        return totalPrice.toFixed(2);
    };


    const handleDelete = useCallback(
        async (productId) => {
          try {
            await fetch(`your_backend_url/products/${productId}`, {
              method: 'DELETE',
              headers:{
                 Authorization: `Bearer ${authToken}`,
                'Content-Type': 'application/json'
              }
            });
      
            const updatedCart = cart.filter((item) => item.id !== productId);
            setCart(updatedCart);
      
            setQuantities((prevQuantities) => {
              const { [productId]: deletedQuantity, ...updatedQuantities } = prevQuantities;
              return updatedQuantities;
            });
      
            setCartCount(cartCount - 1);
          } catch (error) {
            console.error('Error deleting product:', error);
          }
        },
        [cart, cartCount, setCart, setCartCount, setQuantities]
      );
      

    const handleSubmit = useCallback(
        async (event) => {
          event.preventDefault();
      
          const products = cart.map((product) => ({
            productId: product.id,
            quantity: quantities[product._id] || 1,
        }));

        const amount = calculateTotalPrice();
    
        const formData = {
            totalAmount: amount,
            date: checkoutData.date,
            sendersAccount: checkoutData.senderAccount,
            productDetails: products, 
        };
      
        console.log(formData); 
    
        try {
        const response = await fetch('http:localhost/api/order', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData),
        });
    
        if (response.ok) {
            const transaction = await response.json();
        } else {
            console.log('Error during transaction');
        }
        } catch (error) {
        console.log("Couldn't make transaction due to", error);
        }
        },
        [cart, checkoutData, quantities, calculateTotalPrice]
    );
      

    const toggleAccordion=(productId)=>{
        if (selectedProduct===productId){
            setSelectedProduct(null);
        }else{
            setSelectedProduct(productId);
        }
    };

    return (
        <div className="products w-full flex flex-wrap gap-5 justify-center ">
            <h2 className="text-5xl w-full ml-8 mt-3 font-bold">Shopping Cart</h2>
            <hr className="w-full"/>
            {cart.length==0 && 
                <div className="flex flex-col justify-center items-center">
                    <CiShoppingCart className="text-9xl w-full"/>
                    <h1 className="text-xl italic">Opps you didin't add any product!!!</h1>
                    <Link to="/" className="text-center bg-primary text-white p-1 rounded mt-3">Back to Shop</Link>
                </div>
            }
            {cart.length>0 && cart.map((product)=>(
                <div key={product._id} className="product bg-white justify-self-center rounded-lg p-6 w-64 shadow-2xl my-10">
                    <img src={product.imageUrl} alt={product.name} className="w-full h-40 object-cover rounded-md mb-4"/>
                    <div className="flex flex-wrap gap-3">
                        <h3 className="text-lg font-semibold mb-2">{product.name} </h3>
                        <p className="text-green-600 font-bold">Price: {product.price}Br.</p>
                        <button onClick={() => toggleAccordion(product._id)} className="text-blue-500 font-semibold mb-2 focus:outline-none">
                            {selectedProduct === product._id ? 'Hide Description' : 'Show Description'}
                        </button>
                        {selectedProduct === product._id && (
                            <p className="text-gray-600 mb-2 w-full">{product.description}</p>
                        )}
                        <div>
                            <label className="mr-3">Quantity</label>
                            <input type="number" id="quantity" name="quantity" min="1" max="50" placeholder="1" className="p-0 pl-2"
              onChange={(e) => handleQuantityChange(product._id, e.target.value)}/>
                        </div>
                        
                    </div> 
                    <p>={(product.price * (quantities[product.id] || 1))}Br</p>
                    <button className="bg-blue-700 text-white float-right p-1 rounded" onClick={() => handleDelete(product._id)}>Remove</button>
                </div>
                
            ))}

            {cart.length>0 && 
                <form className="w-96" onSubmit={handleSubmit} >
                    <p className="w-full mb-10 font-bold">Total Price: {calculateTotalPrice()}</p>
                    <label className="">Choose delivery date<input type="date" className="w-full" placeholder="Choose delivery date" required onChange={(event)=>{handleCheckoutData("date", event)}}/></label>
                    <select className="w-full my-10" required onChange={(event)=>{handleCheckoutData("deliveryLocation", event)}}>
                        <option value="">Choose delivery location</option>
                        <option value="Addis Ketema">Addis Ketema</option>
                        <option value="Akaky Kaliti">Akaky Kaliti</option>
                        <option value="Arada">Arada</option>
                        <option value="Bole">Bole</option>
                        <option value="Gullele">Gullele</option>
                        <option value="Kirkos">Kirkos</option>
                        <option value="Kolfe Keranio">Kolfe Keranio</option>
                        <option value="Lideta">Lideta</option>
                        <option value="Nifas Silk-Lafto">Nifas Silk-Lafto</option>
                        <option value="Yeka">Yeka</option>
                    </select>
                    <label className="">Enter CBE Account Number<input type="number" className="w-full" placeholder="Account Number" required onChange={(event)=>{handleCheckoutData("senderAccount", event)}}/></label>
                    <button className="bg-blue-500 text-white w-full my-10 p-1" type="submit">Proceed to Checkout</button>  
                </form>
            }
        </div>
    );
}
 
export default Cart;