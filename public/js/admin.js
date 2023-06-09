const deleteFunction = (btn) => {
    const productId = btn.parentNode.querySelector('[name=productId]').value;
    const jwtToken = btn.parentNode.querySelector('[name=jsonToken]').value;

    const productItem = btn.closest('.book-container');
    // console.log(btn.parentNode.parentNode.parentNode.parentNode);
    console.log(productId);
    console.log(jwtToken);
    
    fetch('/admin/products/'+productId,{
        method:'POST',
        headers:{
            'jwt-token':jwtToken
        }
    }).then(result => {
        return result.json();
    }).then(result => {
        console.log(result);
        console.log(productItem);
        productItem.remove();
    }).catch(error => {
        console.log(error);
    })
}