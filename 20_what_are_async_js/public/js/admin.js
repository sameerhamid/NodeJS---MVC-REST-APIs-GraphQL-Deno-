const deleteProduct = (btn) => {
  const productId = btn.parentNode.querySelector("[name=productId]").value;
  const crf = btn.parentNode.querySelector("[name=_csrf]").value;
  console.log(crf);
};
