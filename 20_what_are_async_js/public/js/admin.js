const deleteProduct = (btn) => {
  const productId = btn.parentNode.querySelector("[name=productId]").value;
  const csrf = btn.parentNode.querySelector("[name=_csrf]").value;
  const productElt = btn.closest("article");

  fetch(`/admin/product/${productId}`, {
    method: "DELETE",
    headers: {
      "csrf-token": csrf,
    },
  })
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      productElt.parentNode.removeChild(productElt);
    })
    .catch((err) => {
      console.log("Error while deleting>>>", err);
    });
};
