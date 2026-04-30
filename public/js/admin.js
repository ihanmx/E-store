const deleteProduct = (btn) => {
  console.log("delete product");
  const prodId = btn.parentNode.querySelector('[name="productId"]').value;

  fetch("/admin/product/" + prodId, {
    method: "DELETE",
  })
    .then((result) => {
      console.log(result);
    })
    .then((data) => {
      console.log(data);
      btn.parentNode.parentNode.parentNode.remove(); //remove the product from the UI after deleting it from the database
    })
    .catch((err) => {
      console.log(err);
    });
};
